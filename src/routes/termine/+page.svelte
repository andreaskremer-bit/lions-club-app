<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, SegmentedControl, Tag, StatusBadge } from '$lib/components/ui';
	import type { Status } from '$lib/components/ui';
	import {
		ChevronLeft,
		ChevronRight,
		X,
		Plus,
		MapPin,
		Check,
		HelpCircle,
		CalendarDays,
		List as ListIcon
	} from '@lucide/svelte';
	import type { EventListItem, EventType } from './+page';

	let { data } = $props();

	let view = $state<'anstehend' | 'vergangen'>('anstehend');
	const viewOptions = [
		{ value: 'anstehend', label: 'Anstehend' },
		{ value: 'vergangen', label: 'Vergangen' }
	];

	let viewMode = $state<'liste' | 'kalender'>('liste');

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

	// Datums-Chip + Zeit.
	const wdFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
	const moFmt = new Intl.DateTimeFormat('de-DE', { month: 'short' });
	const monthGroupFmt = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
	const chip = (iso: string) => {
		const d = new Date(iso);
		return {
			wd: wdFmt.format(d).replace('.', '').toUpperCase(),
			day: d.getDate(),
			mo: moFmt.format(d).replace('.', '').slice(0, 3).toUpperCase(),
			time: timeFmt.format(d)
		};
	};

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

	// Nach Monat gruppieren (Reihenfolge bleibt erhalten).
	let grouped = $derived.by(() => {
		const groups: { key: string; label: string; events: EventListItem[] }[] = [];
		for (const e of list) {
			const d = new Date(e.starts_at);
			const key = `${d.getFullYear()}-${d.getMonth()}`;
			let g = groups.find((x) => x.key === key);
			if (!g) {
				g = { key, label: monthGroupFmt.format(d), events: [] };
				groups.push(g);
			}
			g.events.push(e);
		}
		return groups;
	});

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
	<AppBar title="Termine" eyebrow="Lions Club Bonn-Rheinaue" large bordered>
		{#snippet trailing()}
			<IconButton
				label={viewMode === 'liste' ? 'Kalenderansicht' : 'Listenansicht'}
				onclick={() => (viewMode = viewMode === 'liste' ? 'kalender' : 'liste')}
			>
				{#snippet icon()}
					{#if viewMode === 'liste'}<CalendarDays />{:else}<ListIcon />{/if}
				{/snippet}
			</IconButton>
			{#if data.permissions.includes('manage_events')}
				<IconButton label="Termine planen" onclick={() => goto(resolve('/termine/planung'))}>
					{#snippet icon()}<Plus />{/snippet}
				</IconButton>
			{/if}
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#if viewMode === 'liste'}
			<SegmentedControl options={viewOptions} bind:value={view} />

			{#each grouped as g (g.key)}
				<p class="month">{g.label}</p>
				<div class="list">
					{#each g.events as e (e.id)}
						{@const c = counts(e)}
						{@const ch = chip(e.starts_at)}
						<div class="ev">
							<button class="ev__main" onclick={() => goto(resolve('/termine/[id]', { id: e.id }))}>
								<span class="ev__chip">
									<span class="ev__chip-wd">{ch.wd}</span>
									<span class="ev__chip-day">{ch.day}</span>
									<span class="ev__chip-mo">{ch.mo}</span>
								</span>
								<span class="ev__content">
									<span class="ev__title">{e.title}</span>
									<span class="ev__meta">
										{#if e.location}<MapPin size={15} /> {e.location} · {/if}{ch.time}
									</span>
									<span class="ev__badges">
										<Tag tone="blue">{typeLabel[e.type]}</Tag>
										<StatusBadge status={ownStatus(e)} />
									</span>
								</span>
							</button>
							<button class="ev__counts" onclick={() => openSheet(e)} aria-label="Meldungen ansehen">
								<span class="ev__c ev__c--yes"><Check size={16} /> {c.zu}</span>
								<span class="ev__c ev__c--no"><X size={16} /> {c.ab}</span>
								<span class="ev__c ev__c--open"><HelpCircle size={16} /> {c.offen}</span>
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<p class="empty">
					{view === 'anstehend' ? 'Keine anstehenden Termine.' : 'Keine vergangenen Termine.'}
				</p>
			{/each}
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
	.month {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--text-secondary);
		margin: var(--space-2) 0 0;
	}
	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.ev {
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-lg);
		background: var(--surface-card);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.ev__main {
		display: flex;
		gap: var(--space-3);
		width: 100%;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		color: inherit;
		font: inherit;
		padding: 0;
	}
	.ev__chip {
		flex: none;
		width: 56px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1px;
		padding: var(--space-2) 0;
		background: var(--surface-blue);
		border-radius: var(--radius-md);
		color: var(--blue-700);
	}
	.ev__chip-wd,
	.ev__chip-mo {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.04em;
	}
	.ev__chip-day {
		font-size: var(--text-xl);
		font-weight: var(--fw-bold);
		line-height: 1;
	}
	.ev__content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}
	.ev__title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--fw-semibold);
		color: var(--text-strong);
		line-height: var(--leading-tight);
	}
	.ev__meta {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.ev__meta :global(svg) {
		flex: none;
	}
	.ev__badges {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: 2px;
	}
	.ev__counts {
		display: flex;
		gap: var(--space-4);
		background: none;
		border: none;
		border-top: 1px solid var(--border-hairline);
		padding: var(--space-3) 0 0;
		cursor: pointer;
		font: inherit;
	}
	.ev__c {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: var(--text-base);
		font-weight: var(--fw-semibold);
		font-variant-numeric: tabular-nums;
	}
	.ev__c--yes {
		color: var(--status-yes-fg);
	}
	.ev__c--no {
		color: var(--status-no-fg);
	}
	.ev__c--open {
		color: var(--text-secondary);
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
		outline: 1px solid var(--gold-600);
	}
	.cal__day--sel {
		background: var(--primary);
		color: #fff;
	}
	.cal__dot {
		position: absolute;
		bottom: 6px;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--primary);
	}
	.cal__day--sel .cal__dot {
		background: #fff;
	}
	.day-ev {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-md, 12px);
		background: var(--surface-card);
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
		background: var(--surface-card);
		border-radius: var(--radius-lg, 16px) var(--radius-lg, 16px) 0 0;
		padding: var(--space-4) var(--screen-pad) calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
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
