<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, SegmentedControl, Avatar } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	const statusOptions = [
		{ value: 'an', label: 'Anwesend' },
		{ value: 'ab', label: 'Abwesend' }
	];

	// Markierungen je Mitglied. Vorrang: bereits erfasste Anwesenheit; sonst aus
	// der Rückmeldung vorbelegt (zugesagt→anwesend, abgesagt→abwesend); offen bleibt leer.
	const snap = untrack(() => ({
		members: data.members,
		attendance: data.attendance,
		rsvp: data.rsvp
	}));
	const initial: Record<string, 'an' | 'ab'> = {};
	for (const m of snap.members) {
		if (m.id in snap.attendance) initial[m.id] = snap.attendance[m.id] ? 'an' : 'ab';
		else if (snap.rsvp[m.id] === 'zugesagt') initial[m.id] = 'an';
		else if (snap.rsvp[m.id] === 'abgesagt') initial[m.id] = 'ab';
	}
	let marks = $state<Record<string, 'an' | 'ab'>>(initial);

	// Hinweis nur, wenn überhaupt aus Rückmeldungen vorbelegt wurde (und noch nichts erfasst war).
	const prefilledFromRsvp =
		Object.keys(snap.attendance).length === 0 && Object.keys(snap.rsvp).length > 0;

	let saving = $state(false);
	let err = $state('');
	let saved = $state(false);

	let markedCount = $derived(data.members.filter((m) => marks[m.id]).length);

	function setAll(v: 'an' | 'ab') {
		for (const m of data.members) marks[m.id] = v;
	}

	async function save() {
		if (saving) return;
		saving = true;
		err = '';
		saved = false;
		const rows = data.members
			.filter((m) => marks[m.id])
			.map((m) => ({
				event_id: data.event.id,
				member_id: m.id,
				present: marks[m.id] === 'an',
				recorded_by: data.memberId
			}));
		const { error } = await supabase
			.from('attendance')
			.upsert(rows, { onConflict: 'event_id,member_id' });
		saving = false;
		if (error) {
			err = error.message;
			return;
		}
		saved = true;
	}
</script>

<div class="shell">
	<AppBar title="Anwesenheit" eyebrow={data.event.title} bordered>
		{#snippet leading()}
			<IconButton
				label="Zurück"
				onclick={() => goto(resolve('/termine/[id]', { id: data.event.id }))}
			>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<div class="bulk">
			<span class="bulk__label">{markedCount} von {data.members.length} markiert</span>
			<Button variant="ghost" onclick={() => setAll('an')}>Alle anwesend</Button>
		</div>
		{#if prefilledFromRsvp}
			<p class="hint">Aus den Rückmeldungen vorbelegt – bitte prüfen und speichern.</p>
		{/if}

		<div class="rows">
			{#each data.members as m (m.id)}
				<div class="att">
					<Avatar name={`${m.first_name} ${m.last_name}`} size="sm" />
					<span class="att__name">
						{m.first_name}
						{m.last_name}
						{#if m.status !== 'aktiv'}<em class="att__tag">{m.status}</em>{/if}
					</span>
					<div class="att__seg">
						<SegmentedControl
							options={statusOptions}
							value={marks[m.id]}
							onchange={(v) => (marks[m.id] = v as 'an' | 'ab')}
						/>
					</div>
				</div>
			{/each}
		</div>

		{#if err}<p class="err">Speichern fehlgeschlagen: {err}</p>{/if}
		{#if saved}<p class="ok">Anwesenheit gespeichert.</p>{/if}

		<Button fullWidth disabled={saving || markedCount === 0} onclick={save}>
			{saving ? 'Speichern …' : 'Anwesenheit speichern'}
		</Button>
	</main>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		max-width: var(--content-max);
		margin: 0 auto;
	}
	.shell__body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--screen-pad);
	}
	.bulk {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.bulk__label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.hint {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}
	.rows {
		display: flex;
		flex-direction: column;
	}
	.att {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.att__name {
		flex: 1;
		font-size: var(--text-base);
		color: var(--text-strong);
		min-width: 0;
	}
	.att__tag {
		font-style: normal;
		font-size: var(--text-xs);
		color: var(--text-secondary);
		margin-left: var(--space-1);
	}
	.att__seg {
		flex: none;
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-sm);
		margin: 0;
	}
	.ok {
		color: var(--sage-ink, #3f6b4f);
		font-size: var(--text-sm);
		margin: 0;
	}
</style>
