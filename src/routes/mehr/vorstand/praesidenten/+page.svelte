<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Card } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';
	import { lionsYearLabel } from '$lib/amtHistory';

	let { data } = $props();
</script>

<div class="shell">
	<AppBar title="Präsidenten" eyebrow="Chronik des Clubs" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mehr/vorstand'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#if data.presidents.length > 0}
			<Card>
				<dl class="list">
					{#each data.presidents as p (p.year)}
						<div class="row">
							<dt>{lionsYearLabel(p.year)}</dt>
							<dd>
								{#if p.memberId}
									<a href={resolve('/mitglieder/[id]', { id: p.memberId })}>{p.name}</a>
								{:else}
									{p.name}
								{/if}
							</dd>
						</div>
					{/each}
				</dl>
			</Card>
		{:else}
			<p class="muted">Noch keine Präsidenten eingetragen.</p>
		{/if}
	</main>
</div>

<style>
	.list {
		margin: 0;
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-3);
		min-height: 44px;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.row:last-child {
		border-bottom: 0;
	}
	dt {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-variant-numeric: tabular-nums;
	}
	dd {
		margin: 0;
		font-size: var(--text-base);
		text-align: right;
	}
	dd a {
		color: var(--accent, #1e4fa3);
		text-decoration: none;
		display: inline-block;
		min-height: 44px;
		line-height: 44px;
	}
	.muted {
		color: var(--text-secondary);
	}
</style>
