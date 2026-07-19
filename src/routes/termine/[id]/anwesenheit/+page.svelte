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

	// Vorbelegung je Mitglied. Vorrang: bereits erfasste Anwesenheit; sonst aus der
	// Rückmeldung (zugesagt→anwesend); abgesagt UND ohne Reaktion → abwesend.
	const snap = untrack(() => ({
		members: data.members,
		attendance: data.attendance,
		rsvp: data.rsvp
	}));
	const initial: Record<string, 'an' | 'ab'> = {};
	for (const m of snap.members) {
		if (m.id in snap.attendance) initial[m.id] = snap.attendance[m.id] ? 'an' : 'ab';
		else if (snap.rsvp[m.id] === 'zugesagt') initial[m.id] = 'an';
		else initial[m.id] = 'ab';
	}
	let marks = $state<Record<string, 'an' | 'ab'>>(initial);

	// Abschnitte nach RSVP (stabil – der Anwesenheits-Schalter sortiert NICHT um,
	// die Zeile bleibt in ihrem Abschnitt). data.members ist nach Nachnamen sortiert.
	let groups = $derived([
		{
			key: 'zugesagt',
			label: 'Angemeldet',
			members: data.members.filter((m) => data.rsvp[m.id] === 'zugesagt')
		},
		{
			key: 'abgesagt',
			label: 'Abgemeldet',
			members: data.members.filter((m) => data.rsvp[m.id] === 'abgesagt')
		},
		{
			key: 'offen',
			label: 'Ohne Reaktion',
			members: data.members.filter((m) => !data.rsvp[m.id])
		}
	]);

	// Noch nichts erfasst → auf die Vorbelegung hinweisen.
	const freshPrefill = Object.keys(snap.attendance).length === 0;

	let saving = $state(false);
	let err = $state('');
	let saved = $state(false);

	let anwesendCount = $derived(data.members.filter((m) => marks[m.id] === 'an').length);
	let abwesendCount = $derived(data.members.filter((m) => marks[m.id] === 'ab').length);

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
			<span class="bulk__label">{anwesendCount} anwesend · {abwesendCount} abwesend</span>
			<Button variant="ghost" onclick={() => setAll('an')}>Alle anwesend</Button>
		</div>
		{#if freshPrefill}
			<p class="hint">
				Vorbelegt aus den Rückmeldungen (ohne Reaktion = abwesend) – bitte prüfen und speichern.
			</p>
		{/if}

		{#each groups as g (g.key)}
			<section>
				<h2 class="grp__head">{g.label} <span class="grp__count">({g.members.length})</span></h2>
				<div class="rows">
					{#each g.members as m (m.id)}
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
					{:else}
						<p class="empty">—</p>
					{/each}
				</div>
			</section>
		{/each}

		{#if err}<p class="err">Speichern fehlgeschlagen: {err}</p>{/if}
		{#if saved}<p class="ok">Anwesenheit gespeichert.</p>{/if}

		<Button fullWidth disabled={saving} onclick={save}>
			{saving ? 'Speichern …' : 'Anwesenheit speichern'}
		</Button>
	</main>
</div>

<style>
	.shell__body {
		gap: var(--space-3);
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
	.grp__head {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: var(--space-2) 0 var(--space-1);
	}
	.grp__count {
		font-weight: 400;
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
	.empty {
		color: var(--text-secondary);
		font-size: var(--text-sm);
		margin: var(--space-1) 0 var(--space-2);
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
