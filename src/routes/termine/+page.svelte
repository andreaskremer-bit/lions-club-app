<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, SegmentedControl, Tag, StatusBadge } from '$lib/components/ui';
	import type { Status } from '$lib/components/ui';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import type { EventListItem, EventType } from './+page';

	let { data } = $props();

	let view = $state<'anstehend' | 'vergangen'>('anstehend');
	const viewOptions = [
		{ value: 'anstehend', label: 'Anstehend' },
		{ value: 'vergangen', label: 'Vergangen' }
	];

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

	function ownStatus(e: EventListItem): Status {
		const r = e.event_response.find((x) => x.member_id === data.myMemberId);
		if (!r) return 'open';
		return r.status === 'zugesagt' ? 'yes' : 'no';
	}

	function counts(e: EventListItem) {
		const zu = e.event_response.filter((r) => r.status === 'zugesagt').length;
		const ab = e.event_response.filter((r) => r.status === 'abgesagt').length;
		const offen = Math.max(0, data.activeCount - zu - ab);
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
				return view === 'anstehend' ? ta - tb : tb - ta; // anstehend: nächster oben; vergangen: jüngster oben
			})
	);
</script>

<div class="shell">
	<AppBar title="Termine" eyebrow="Programm" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<SegmentedControl options={viewOptions} bind:value={view} />

		<div class="list">
			{#each list as e (e.id)}
				{@const c = counts(e)}
				<a class="termin" href={resolve('/termine/[id]', { id: e.id })}>
					<div class="termin__row">
						<span class="termin__title">{e.title}</span>
						<StatusBadge status={ownStatus(e)} />
					</div>
					<div class="termin__when">
						{formatWhen(e.starts_at)}{e.location ? ` · ${e.location}` : ''}
					</div>
					<div class="termin__foot">
						<Tag tone="blue" outline>{typeLabel[e.type]}</Tag>
						<span class="termin__counts">
							{c.zu} angemeldet · {c.ab} abgemeldet · {c.offen} offen
						</span>
						<ChevronRight size={18} class="termin__chev" />
					</div>
				</a>
			{:else}
				<p class="empty">
					{view === 'anstehend' ? 'Keine anstehenden Termine.' : 'Keine vergangenen Termine.'}
				</p>
			{/each}
		</div>
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
	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.termin {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.1));
		border-radius: var(--radius-md, 12px);
		background: var(--surface, #fff);
		text-decoration: none;
		color: inherit;
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
	.termin__foot {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.termin__counts {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.termin :global(.termin__chev) {
		margin-left: auto;
		color: var(--text-secondary);
		flex: none;
	}
</style>
