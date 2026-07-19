<script lang="ts">
	import { untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, Card, Tag, Input } from '$lib/components/ui';
	import AnswerField from '$lib/components/AnswerField.svelte';
	import EventDocuments from '$lib/components/EventDocuments.svelte';
	import {
		ChevronLeft,
		ChevronDown,
		Check,
		X,
		UserPlus,
		Trash2,
		ClipboardCheck,
		ListChecks,
		Users,
		Pencil,
		CalendarPlus
	} from '@lucide/svelte';
	import type { EventType } from '../+page';
	import { buildIcs, icsFilename } from '$lib/ics';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let e = $derived(data.event);

	function exportIcs() {
		const ics = buildIcs({
			id: e.id,
			title: e.title,
			location: e.location,
			description: e.description,
			starts_at: e.starts_at,
			ends_at: e.ends_at
		});
		const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = icsFilename(e.title);
		a.click();
		URL.revokeObjectURL(url);
	}

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

	// Schreibbares $derived: startet beim geladenen Kommentar, bleibt editierbar.
	let comment = $derived(myResponse?.comment ?? '');
	let newCompanion = $state('');
	let busy = $state(false);
	let err = $state('');

	let zugesagt = $derived(e.event_response.filter((r) => r.status === 'zugesagt'));
	let abgesagt = $derived(e.event_response.filter((r) => r.status === 'abgesagt'));
	let zuGuests = $derived(zugesagt.reduce((n, r) => n + r.companion.length, 0));
	let zuPersonen = $derived(zugesagt.length + zuGuests);
	// „Offen" = aktive Mitglieder, die noch nicht reagiert haben (deckt sich mit dem Karten-Zaehler).
	let offen = $derived.by(() => {
		const responded = new Set(e.event_response.map((r) => r.member_id));
		return data.activeMembers.filter((m) => !responded.has(m.id));
	});
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

	async function insertCompanion(name: string) {
		if (!myResponse || !name.trim() || busy) return;
		busy = true;
		err = '';
		const { error } = await supabase
			.from('companion')
			.insert({ event_response_id: myResponse.id, name: name.trim() });
		busy = false;
		if (error) {
			err = error.message;
			return;
		}
		await invalidateAll();
	}

	async function addCompanion() {
		const name = newCompanion.trim();
		if (!name) return;
		await insertCompanion(name);
		if (!err) newCompanion = '';
	}

	// Partner aus dem Mitgliederprofil als Begleitung übernehmen (kein Doppel).
	let partnerAdded = $derived(
		!!data.partnerName && (myResponse?.companion ?? []).some((c) => c.name === data.partnerName)
	);

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

	// ── Zusatzabfragen beantworten ──────────────────────────────────────────────
	// Respondenten: das Mitglied selbst (id = null) + eigene Begleitpersonen.
	let respondents = $derived([
		{ id: null as string | null, label: 'Du' },
		...(myResponse?.companion ?? []).map((c) => ({ id: c.id, label: c.name }))
	]);

	const answerKey = (qid: string, companionId: string | null) => `${qid}:${companionId ?? 'self'}`;

	// Lokaler Antwort-Status (mit Zeilen-IDs), initial aus den geladenen Antworten.
	let answersMap = $state<Record<string, { id: string; value: unknown }>>(
		untrack(() => {
			const m: Record<string, { id: string; value: unknown }> = {};
			for (const a of data.myAnswers)
				m[answerKey(a.question_id, a.companion_id)] = { id: a.id, value: a.value };
			return m;
		})
	);
	let answerErr = $state('');

	const valueFor = (qid: string, companionId: string | null): unknown =>
		answersMap[answerKey(qid, companionId)]?.value ?? null;

	async function saveAnswer(qid: string, companionId: string | null, value: unknown) {
		if (!data.myMemberId) return;
		answerErr = '';
		const key = answerKey(qid, companionId);
		const cur = answersMap[key];
		if (cur?.id) {
			const { error } = await supabase.from('answer').update({ value }).eq('id', cur.id);
			if (error) {
				answerErr = 'Antwort konnte nicht gespeichert werden.';
				return;
			}
			answersMap[key] = { id: cur.id, value };
		} else {
			const { data: row, error } = await supabase
				.from('answer')
				.insert({ question_id: qid, member_id: data.myMemberId, companion_id: companionId, value })
				.select('id')
				.single();
			if (error || !row) {
				answerErr = 'Antwort konnte nicht gespeichert werden.';
				return;
			}
			answersMap[key] = { id: row.id, value };
		}
	}
</script>

<div class="shell">
	<AppBar title="Termin" eyebrow={typeLabel[e.type]} bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/termine'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
		{#snippet trailing()}
			<IconButton label="In meinen Kalender" onclick={exportIcs}>
				{#snippet icon()}<CalendarPlus />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<header class="head">
			<h1 class="head__title">{e.title}</h1>
			{#if e.speaker}<p class="head__speaker">Referent/in: {e.speaker}</p>{/if}
			<p class="head__when">{dateFmt.format(new Date(e.starts_at))} Uhr</p>
			{#if e.location}<p class="head__loc">{e.location}</p>{/if}
			<Tag tone="blue" outline>{typeLabel[e.type]}</Tag>
		</header>

		{#if e.description}
			<Card><p class="desc">{e.description}</p></Card>
		{/if}

		<EventDocuments
			{supabase}
			eventId={e.id}
			canManage={data.permissions.includes('manage_events') ||
				data.permissions.includes('publish_content')}
			memberId={data.myMemberId}
		/>

		{#if e.donation_required && data.permissions.includes('record_attendance')}
			<Button
				fullWidth
				variant="secondary"
				onclick={() => goto(resolve('/termine/[id]/anwesenheit', { id: e.id }))}
			>
				{#snippet iconLeft()}<ClipboardCheck size={18} />{/snippet}
				Anwesenheit erfassen
			</Button>
		{/if}

		{#if data.permissions.includes('manage_events')}
			<div class="admin-actions">
				<Button
					variant="secondary"
					onclick={() => goto(resolve('/termine/[id]/bearbeiten', { id: e.id }))}
				>
					{#snippet iconLeft()}<Pencil size={18} />{/snippet}
					Termin bearbeiten
				</Button>
				<Button
					variant="secondary"
					onclick={() => goto(resolve('/termine/[id]/fragen', { id: e.id }))}
				>
					{#snippet iconLeft()}<ListChecks size={18} />{/snippet}
					Fragen verwalten
				</Button>
				<Button
					variant="secondary"
					onclick={() => goto(resolve('/termine/[id]/teilnehmer', { id: e.id }))}
				>
					{#snippet iconLeft()}<Users size={18} />{/snippet}
					Teilnehmerliste
				</Button>
			</div>
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
						{#if data.partnerName && !partnerAdded}
							<Button
								variant="secondary"
								fullWidth
								disabled={busy}
								onclick={() => insertCompanion(data.partnerName!)}
							>
								{#snippet iconLeft()}<UserPlus size={18} />{/snippet}
								{data.partnerName} hinzufügen
							</Button>
						{/if}
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

		<!-- Zusatzabfragen -->
		{#if data.questions.length}
			<Card>
				<h2 class="sec">Fragen</h2>
				{#if data.isPast}
					<p class="muted">Vergangener Termin – Antworten sind schreibgeschützt.</p>
				{/if}
				{#each data.questions as q (q.id)}
					<div class="q-block">
						<p class="q-label">{q.label}{q.required ? ' *' : ''}</p>
						{#each respondents as r (r.id ?? 'self')}
							<div class="q-resp">
								{#if respondents.length > 1}<span class="q-resp__who">{r.label}</span>{/if}
								<AnswerField
									qtype={q.qtype}
									options={q.options}
									value={valueFor(q.id, r.id)}
									disabled={data.isPast}
									onsave={(v) => saveAnswer(q.id, r.id, v)}
								/>
							</div>
						{/each}
					</div>
				{/each}
				{#if answerErr}<p class="err">{answerErr}</p>{/if}
			</Card>
		{/if}

		<!-- Meldungen -->
		<Card>
			<h2 class="sec">Meldungen</h2>

			<details class="mgrp" open>
				<summary class="grp">
					<ChevronDown size={18} />
					<span class="grp__label">Zugesagt ({zuPersonen})</span>
					{#if zuGuests}<span class="grp__split"
							>· {zugesagt.length}
							{zugesagt.length === 1 ? 'Mitglied' : 'Mitglieder'}, {zuGuests}
							{zuGuests === 1 ? 'Gast' : 'Gäste'}</span
						>{/if}
				</summary>
				<ul class="names">
					{#each zugesagt as r (r.id)}
						<li>{name(r)}{r.companion.length ? ` (+${r.companion.length})` : ''}</li>
					{:else}
						<li class="muted">—</li>
					{/each}
				</ul>
			</details>

			<details class="mgrp">
				<summary class="grp">
					<ChevronDown size={18} />
					<span class="grp__label">Abgesagt ({abgesagt.length})</span>
				</summary>
				<ul class="names">
					{#each abgesagt as r (r.id)}
						<li>{name(r)}</li>
					{:else}
						<li class="muted">—</li>
					{/each}
				</ul>
			</details>

			<details class="mgrp">
				<summary class="grp">
					<ChevronDown size={18} />
					<span class="grp__label">Offen ({offen.length})</span>
				</summary>
				<ul class="names">
					{#each offen as m (m.id)}
						<li>{m.first_name} {m.last_name}</li>
					{:else}
						<li class="muted">—</li>
					{/each}
				</ul>
			</details>
		</Card>
	</main>
</div>

<style>
	.head {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.head__title {
		font-size: var(--text-xl);
		margin: 0;
	}
	.head__speaker {
		font-size: var(--text-base);
		color: var(--text-strong);
		font-weight: 600;
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
	.mgrp {
		border-top: 1px solid var(--border-hairline);
	}
	.mgrp:first-of-type {
		border-top: none;
	}
	.grp {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
		min-height: 44px;
		cursor: pointer;
		list-style: none;
	}
	.grp::-webkit-details-marker {
		display: none;
	}
	.grp :global(svg) {
		flex: none;
		color: var(--text-secondary);
		transition: transform 0.15s ease;
	}
	.mgrp[open] > .grp :global(svg) {
		transform: rotate(180deg);
	}
	.grp__label {
		flex: none;
	}
	.grp__split {
		font-weight: 400;
		color: var(--text-secondary);
	}
	.names {
		margin: 0 0 var(--space-3);
		padding-left: calc(18px + var(--space-2));
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
	.admin-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.admin-actions :global(.lc-btn) {
		width: 100%;
	}
	.q-block {
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.06));
	}
	.q-block:last-child {
		border-bottom: none;
	}
	.q-label {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
		margin: 0 0 var(--space-2);
	}
	.q-resp {
		margin-bottom: var(--space-2);
	}
	.q-resp__who {
		display: block;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-bottom: var(--space-1);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-sm);
		margin: var(--space-2) 0 0;
	}
</style>
