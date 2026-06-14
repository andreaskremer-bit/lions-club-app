<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, Card, Tag, Input } from '$lib/components/ui';
	import { ChevronLeft, Check, X, UserPlus, Trash2 } from '@lucide/svelte';
	import type { EventType } from '../+page';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let e = $derived(data.event);

	const typeLabel: Record<EventType, string> = {
		clubabend: 'Club-Abend',
		versammlung: 'Mitglieder-Versammlung',
		reise: 'Club-Reise',
		gesellig: 'Gesellig',
		lions_termin: 'Lions-Termin'
	};
	const dateFmt = new Intl.DateTimeFormat('de-DE', {
		weekday: 'long',
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	let myResponse = $derived(e.event_response.find((r) => r.member_id === data.myMemberId) ?? null);
	let ownStatus = $derived(myResponse?.status ?? null);

	let comment = $state('');
	let newCompanion = $state('');
	let busy = $state(false);
	let err = $state('');

	// Kommentar-Feld mit geladenem Wert initialisieren (einmalig je Response)
	$effect(() => {
		comment = myResponse?.comment ?? '';
	});

	let zugesagt = $derived(e.event_response.filter((r) => r.status === 'zugesagt'));
	let abgesagt = $derived(e.event_response.filter((r) => r.status === 'abgesagt'));
	const name = (r: { member: { first_name: string; last_name: string } | null }) =>
		r.member ? `${r.member.first_name} ${r.member.last_name}` : 'Unbekannt';

	async function setStatus(status: 'zugesagt' | 'abgesagt') {
		if (!data.myMemberId || busy) return;
		busy = true;
		err = '';
		const { error } = await supabase
			.from('event_response')
			.upsert(
				{ event_id: e.id, member_id: data.myMemberId, status, comment: comment.trim() || null },
				{ onConflict: 'event_id,member_id' }
			);
		busy = false;
		if (error) {
			err = error.message;
			return;
		}
		await invalidateAll();
	}

	async function addCompanion() {
		if (!myResponse || !newCompanion.trim() || busy) return;
		busy = true;
		err = '';
		const { error } = await supabase
			.from('companion')
			.insert({ event_response_id: myResponse.id, name: newCompanion.trim() });
		busy = false;
		if (error) {
			err = error.message;
			return;
		}
		newCompanion = '';
		await invalidateAll();
	}

	async function removeCompanion(id: string) {
		busy = true;
		err = '';
		const { error } = await supabase.from('companion').delete().eq('id', id);
		busy = false;
		if (error) {
			err = error.message;
			return;
		}
		await invalidateAll();
	}
</script>

<div class="shell">
	<AppBar title="Termin" eyebrow={typeLabel[e.type]} bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/termine'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<header class="head">
			<h1 class="head__title">{e.title}</h1>
			<p class="head__when">{dateFmt.format(new Date(e.starts_at))} Uhr</p>
			{#if e.location}<p class="head__loc">{e.location}</p>{/if}
			<Tag tone="blue" outline>{typeLabel[e.type]}</Tag>
		</header>

		{#if e.description}
			<Card><p class="desc">{e.description}</p></Card>
		{/if}

		<!-- Eigene Rückmeldung -->
		<Card>
			<h2 class="sec">Deine Rückmeldung</h2>
			{#if data.isPast}
				<p class="muted">Vergangener Termin – keine Änderung möglich.</p>
			{:else}
				<div class="rsvp">
					<Button
						variant={ownStatus === 'zugesagt' ? 'primary' : 'secondary'}
						disabled={busy}
						onclick={() => setStatus('zugesagt')}
					>
						{#snippet iconLeft()}<Check size={18} />{/snippet}
						Zusagen
					</Button>
					<Button
						variant={ownStatus === 'abgesagt' ? 'danger' : 'secondary'}
						disabled={busy}
						onclick={() => setStatus('abgesagt')}
					>
						{#snippet iconLeft()}<X size={18} />{/snippet}
						Absagen
					</Button>
				</div>
				<Input
					label="Kommentar (optional)"
					multiline
					bind:value={comment}
					placeholder="z. B. komme etwas später"
				/>
				{#if myResponse}
					<Button variant="ghost" disabled={busy} onclick={() => setStatus(myResponse.status)}>
						Kommentar speichern
					</Button>
				{/if}
			{/if}
			{#if err}<p class="err">{err}</p>{/if}
		</Card>

		<!-- Begleitpersonen -->
		{#if e.companion_allowed}
			<Card>
				<h2 class="sec">Begleitpersonen</h2>
				{#if myResponse}
					{#each myResponse.companion as c (c.id)}
						<div class="comp">
							<span>{c.name}</span>
							{#if !data.isPast}
								<IconButton label="Entfernen" onclick={() => removeCompanion(c.id)} disabled={busy}>
									{#snippet icon()}<Trash2 size={18} />{/snippet}
								</IconButton>
							{/if}
						</div>
					{:else}
						<p class="muted">Noch keine Begleitperson eingetragen.</p>
					{/each}
					{#if !data.isPast}
						<div class="comp-add">
							<Input bind:value={newCompanion} placeholder="Name der Begleitperson" />
							<Button
								variant="secondary"
								disabled={busy || !newCompanion.trim()}
								onclick={addCompanion}
							>
								{#snippet iconLeft()}<UserPlus size={18} />{/snippet}
								Hinzufügen
							</Button>
						</div>
					{/if}
				{:else}
					<p class="muted">Sage zuerst zu, um Begleitpersonen einzutragen.</p>
				{/if}
			</Card>
		{/if}

		<!-- Meldungen -->
		<Card>
			<h2 class="sec">Meldungen</h2>
			<p class="grp">Zugesagt ({zugesagt.length})</p>
			<ul class="names">
				{#each zugesagt as r (r.id)}
					<li>{name(r)}{r.companion.length ? ` (+${r.companion.length})` : ''}</li>
				{:else}
					<li class="muted">—</li>
				{/each}
			</ul>
			<p class="grp">Abgesagt ({abgesagt.length})</p>
			<ul class="names">
				{#each abgesagt as r (r.id)}
					<li>{name(r)}</li>
				{:else}
					<li class="muted">—</li>
				{/each}
			</ul>
		</Card>
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
		gap: var(--space-4);
		padding: var(--screen-pad);
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.head__title {
		font-size: var(--text-xl);
		margin: 0;
	}
	.head__when {
		font-size: var(--text-base);
		color: var(--text-body);
		margin: 0;
	}
	.head__loc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0 0 var(--space-1);
	}
	.desc {
		font-size: var(--text-base);
		color: var(--text-body);
		line-height: var(--leading-normal);
		margin: 0;
	}
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-3);
	}
	.rsvp {
		display: flex;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}
	.rsvp :global(.lc-btn) {
		flex: 1;
	}
	.comp,
	.comp-add {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) 0;
	}
	.comp {
		justify-content: space-between;
	}
	.comp-add {
		margin-top: var(--space-2);
	}
	.comp-add :global(.lc-field) {
		flex: 1;
	}
	.grp {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
		margin: var(--space-2) 0 var(--space-1);
	}
	.names {
		margin: 0 0 var(--space-2);
		padding-left: var(--space-4);
	}
	.names li {
		font-size: var(--text-base);
		color: var(--text-body);
		padding: 2px 0;
	}
	.muted {
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-sm);
		margin: var(--space-2) 0 0;
	}
</style>
