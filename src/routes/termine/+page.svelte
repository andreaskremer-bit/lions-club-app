<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, SegmentedControl, Tag, StatusBadge } from '$lib/components/ui';
	import type { Status } from '$lib/components/ui';
	import { ChevronLeft, ChevronRight, X, Plus } from '@lucide/svelte';
	import type { EventListItem, EventType } from './+page';

	let { data } = $props();

	let view = $state<'anstehend' | 'vergangen'>('anstehend');
	const viewOptions = [
		{ value: 'anstehend', label: 'Anstehend' },
		{ value: 'vergangen', label: 'Vergangen' }
	];

	let viewMode = $state<'liste' | 'kalender'>('liste');
	const modeOptions = [
		{ value: 'liste', label: 'Liste' },
		{ value: 'kalender', label: 'Kalender' }
	];

	// ── Kalender ────────────────────────────────────────────────────────────────
	const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
	const todayKey = dayKey(new Date());
	const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
	const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

	let calMonth = $state(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	let selectedDay = $state<string | null>(null);
	function shiftMonth(delta: number) {
		calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + delta, 1);
		selectedDay = null;
	}
	let monthLabel = $derived(
		new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(calMonth)
	);

	let eventsByDay = $derived.by(() => {
		const map: Record<string, EventListItem[]> = {};
		for (const e of data.events) {
			const k = dayKey(new Date(e.starts_at));
			(map[k] ??= []).push(e);
		}
		return map;
	});

	let cells = $derived.by(() => {
		const y = calMonth.getFullYear();
		const mo = calMonth.getMonth();
		const startWeekday = (new Date(y, mo, 1).getDay() + 6) % 7; // Montag = 0
		const daysInMonth = new Date(y, mo + 1, 0).getDate();
		const arr: ({ day: number; key: string } | null)[] = [];
		for (let i = 0; i < startWeekday; i++) arr.push(null);
		for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d, key: dayKey(new Date(y, mo, d)) });
		return arr;
	});

	let selectedEvents = $derived(selectedDay ? (eventsByDay[selectedDay] ?? []) : []);

	const typeLabel: Record<EventType, string> = {
		clubabend: 'Club-Abend',
		versammlung: 'Mitglieder-Versammlung',
		reise: 'Club-Reise',
		gesellig: 'Gesellig',
		lions_termin: 'Lions-Termin'
	};

	const dateFmt = new Intl.DateTimeFormat('de-DE', {
		weekday: 'short',
		day: '2-digit',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit'
	});
	const formatWhen = (iso: string) => dateFmt.format(new Date(iso)) + ' Uhr';

	let nameById = $derived(
		new Map(data.members.map((m) => [m.id, `${m.first_name} ${m.last_name}`]))
	);
	let activeCount = $derived(data.members.filter((m) => m.status === 'aktiv').length);

	function ownStatus(e: EventListItem): Status {
		const r = e.event_response.find((x) => x.member_id === data.myMemberId);
		if (!r) return 'open';
		return r.status === 'zugesagt' ? 'yes' : 'no';
	}

	function counts(e: EventListItem) {
		const zu = e.event_response.filter((r) => r.status === 'zugesagt').length;
		const ab = e.event_response.filter((r) => r.status === 'abgesagt').length;
		const offen = Math.max(0, activeCount - zu - ab);
		return { zu, ab, offen };
	}

	let now = Date.now();
	let list = $derived(
		data.events
			.filter((e) =>
				view === 'anstehend'
					? new Date(e.starts_at).getTime() >= now
					: new Date(e.starts_at).getTime() < now
			)
			.sort((a, b) => {
				const ta = new Date(a.starts_at).getTime();
				const tb = new Date(b.starts_at).getTime();
				return view === 'anstehend' ? ta - tb : tb - ta;
			})
	);

	// ── Meldungen-Sheet ──────────────────────────────────────────────────────
	let sheetEvent = $state<EventListItem | null>(null);
	let sheetTab = $state<'zugesagt' | 'abgesagt' | 'offen'>('zugesagt');

	function openSheet(e: EventListItem) {
		sheetEvent = e;
		sheetTab = 'zugesagt';
	}
	function closeSheet() {
		sheetEvent = null;
	}

	let sheetNames = $derived.by(() => {
		if (!sheetEvent) return [];
		const responders = new Set(sheetEvent.event_response.map((r) => r.member_id));
		if (sheetTab === 'offen') {
			return data.members
				.filter((m) => m.status === 'aktiv' && !responders.has(m.id))
				.map((m) => `${m.first_name} ${m.last_name}`);
		}
		return sheetEvent.event_response
			.filter((r) => r.status === sheetTab)
			.map((r) => nameById.get(r.member_id) ?? 'Unbekannt')
			.sort((a, b) => a.localeCompare(b, 'de'));
	});

	let sheetTabs = $derived.by(() => {
		if (!sheetEvent) return [];
		const c = counts(sheetEvent);
		return [
			{ value: 'zugesagt', label: `Zugesagt ${c.zu}` },
			{ value: 'abgesagt', label: `Abgesagt ${c.ab}` },
			{ value: 'offen', label: `Offen ${c.offen}` }
		];
	});
</script>

<svelte:window onkeydown={(ev) => ev.key === 'Escape' && closeSheet()} />

<div class="shell">
	<AppBar title="Termine" eyebrow="Programm" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
		{#snippet trailing()}
			{#if data.permissions.includes('manage_events')}
				<IconButton label="Termine planen" onclick={() => goto(resolve('/termine/planung'))}>
					{#snippet icon()}<Plus />{/snippet}
				</IconButton>
			{/if}
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<SegmentedControl options={modeOptions} bind:value={viewMode} />

		{#if viewMode === 'liste'}
			<SegmentedControl options={viewOptions} bind:value={view} />

			<div class="list">
				{#each list as e (e.id)}
					{@const c = counts(e)}
					<div class="termin">
						<button
							class="termin__main"
							onclick={() => goto(resolve('/termine/[id]', { id: e.id }))}
						>
							<div class="termin__row">
								<span class="termin__title">{e.title}</span>
								<StatusBadge status={ownStatus(e)} />
							</div>
							<div class="termin__when">
								{formatWhen(e.starts_at)}{e.location ? ` · ${e.location}` : ''}
							</div>
							<div class="termin__type">
								<Tag tone="blue" outline>{typeLabel[e.type]}</Tag>
								<ChevronRight size={18} class="termin__chev" />
							</div>
						</button>
						<button class="termin__counts" onclick={() => openSheet(e)}>
							{c.zu} angemeldet · {c.ab} abgemeldet · {c.offen} offen
						</button>
					</div>
				{:else}
					<p class="empty">
						{view === 'anstehend' ? 'Keine anstehenden Termine.' : 'Keine vergangenen Termine.'}
					</p>
				{/each}
			</div>
		{:else}
			<div class="cal__nav">
				<IconButton label="Vorheriger Monat" onclick={() => shiftMonth(-1)}>
					{#snippet icon()}<ChevronLeft />{/snippet}
				</IconButton>
				<span class="cal__month">{monthLabel}</span>
				<IconButton label="Nächster Monat" onclick={() => shiftMonth(1)}>
					{#snippet icon()}<ChevronRight />{/snippet}
				</IconButton>
			</div>

			<div class="cal__grid">
				{#each weekdays as wd (wd)}<span class="cal__wd">{wd}</span>{/each}
				{#each cells as cell, i (i)}
					{#if cell}
						{@const evs = eventsByDay[cell.key] ?? []}
						<button
							class={[
								'cal__day',
								cell.key === todayKey ? 'cal__day--today' : '',
								cell.key === selectedDay ? 'cal__day--sel' : ''
							]
								.filter(Boolean)
								.join(' ')}
							onclick={() => (selectedDay = cell.key)}
							disabled={evs.length === 0}
						>
							{cell.day}
							{#if evs.length}<span class="cal__dot"></span>{/if}
						</button>
					{:else}
						<span class="cal__day cal__day--empty"></span>
					{/if}
				{/each}
			</div>

			{#if selectedDay}
				<div class="list">
					{#each selectedEvents as e (e.id)}
						<a class="day-ev" href={resolve('/termine/[id]', { id: e.id })}>
							<span class="day-ev__time">{timeFmt.format(new Date(e.starts_at))}</span>
							<span class="day-ev__title">{e.title}</span>
							<StatusBadge status={ownStatus(e)} />
						</a>
					{/each}
				</div>
			{:else}
				<p class="empty">Tippe einen markierten Tag an.</p>
			{/if}
		{/if}
	</main>
</div>

{#if sheetEvent}
	<button class="sheet__backdrop" aria-label="Schließen" onclick={closeSheet}></button>
	<div class="sheet" role="dialog" aria-modal="true" aria-label="Meldungen">
		<div class="sheet__head">
			<span class="sheet__title">{sheetEvent.title}</span>
			<IconButton label="Schließen" onclick={closeSheet}>
				{#snippet icon()}<X />{/snippet}
			</IconButton>
		</div>
		<SegmentedControl options={sheetTabs} bind:value={sheetTab} />
		<ul class="sheet__names">
			{#each sheetNames as n (n)}
				<li>{n}</li>
			{:else}
				<li class="muted">Niemand</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.shell__body {
		gap: var(--space-3);
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.termin {
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.1));
		border-radius: var(--radius-md, 12px);
		background: var(--surface, #fff);
		overflow: hidden;
	}
	.termin__main {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-3);
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		color: inherit;
		font: inherit;
	}
	.termin__row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.termin__title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
		line-height: var(--leading-snug, 1.3);
	}
	.termin__when {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.termin__type {
		display: flex;
		align-items: center;
	}
	.termin :global(.termin__chev) {
		margin-left: auto;
		color: var(--text-secondary);
	}
	.termin__counts {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border: none;
		border-top: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
		background: var(--surface-sunken, rgba(0, 0, 0, 0.02));
		text-align: left;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		cursor: pointer;
	}
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
	.cal__nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.cal__month {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
		text-transform: capitalize;
	}
	.cal__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--space-1);
	}
	.cal__wd {
		text-align: center;
		font-size: var(--text-xs);
		color: var(--text-secondary);
		padding-bottom: var(--space-1);
	}
	.cal__day {
		position: relative;
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--radius-sm, 8px);
		background: none;
		font: inherit;
		font-size: var(--text-sm);
		color: var(--text-strong);
	}
	.cal__day--empty {
		visibility: hidden;
	}
	.cal__day:disabled {
		color: var(--text-secondary);
		opacity: 0.6;
	}
	.cal__day:not(:disabled) {
		cursor: pointer;
	}
	.cal__day--today {
		outline: 1px solid var(--gold, #b98a22);
	}
	.cal__day--sel {
		background: var(--lions-blue, #1e4fa3);
		color: #fff;
	}
	.cal__dot {
		position: absolute;
		bottom: 6px;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--lions-blue, #1e4fa3);
	}
	.cal__day--sel .cal__dot {
		background: #fff;
	}
	.day-ev {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.1));
		border-radius: var(--radius-md, 12px);
		background: var(--surface, #fff);
		text-decoration: none;
		color: inherit;
	}
	.day-ev__time {
		font-variant-numeric: tabular-nums;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		flex: none;
	}
	.day-ev__title {
		flex: 1;
		font-weight: 600;
		color: var(--text-strong);
		min-width: 0;
	}
	.sheet__backdrop {
		position: fixed;
		inset: 0;
		border: none;
		background: rgba(0, 0, 0, 0.35);
		z-index: 40;
	}
	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 41;
		max-width: var(--content-max);
		margin: 0 auto;
		background: var(--surface, #fff);
		border-radius: var(--radius-lg, 16px) var(--radius-lg, 16px) 0 0;
		padding: var(--space-4) var(--screen-pad)
			calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-height: 70dvh;
	}
	.sheet__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.sheet__title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-strong);
	}
	.sheet__names {
		margin: 0;
		padding-left: var(--space-4);
		overflow-y: auto;
	}
	.sheet__names li {
		font-size: var(--text-base);
		color: var(--text-body);
		padding: var(--space-1) 0;
	}
	.muted {
		color: var(--text-secondary);
		list-style: none;
		margin-left: calc(-1 * var(--space-4));
	}
</style>
