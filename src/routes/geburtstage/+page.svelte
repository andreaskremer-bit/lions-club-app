<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Avatar, Tag } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';
	import { nextBirthdayInfo, type BirthdayInfo } from '$lib/dates';
	import type { BdayMember } from './+page';

	let { data } = $props();

	const dayFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long' });

	type Row = BdayMember & BirthdayInfo;

	let rows = $derived.by((): Row[] =>
		data.members
			.map((m) => ({ ...m, ...nextBirthdayInfo(m.birthday) }))
			.sort((a, b) => a.days - b.days)
	);

	function whenLabel(r: Row): string {
		if (r.today) return 'heute';
		if (r.days === 1) return 'morgen';
		return `in ${r.days} Tagen`;
	}
</script>

<div class="shell">
	<AppBar title="Geburtstage" eyebrow="Mitglieder" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<div class="list">
			{#each rows as r (r.id)}
				<a class="bday" href={resolve('/mitglieder/[id]', { id: r.id })}>
					<Avatar name={`${r.first_name} ${r.last_name}`} size="sm" />
					<span class="bday__main">
						<span class="bday__name">{r.first_name} {r.last_name}</span>
						<span class="bday__date">{dayFmt.format(r.date)} · wird {r.turning}</span>
					</span>
					{#if r.today}
						<Tag tone="gold" dot>heute</Tag>
					{:else}
						<span class="bday__in">{whenLabel(r)}</span>
					{/if}
				</a>
			{:else}
				<p class="empty">Keine Geburtstage hinterlegt.</p>
			{/each}
		</div>
	</main>
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
	}
	.bday {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
		text-decoration: none;
		color: inherit;
	}
	.bday__main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.bday__name {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
	}
	.bday__date {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.bday__in {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		flex: none;
	}
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
</style>
