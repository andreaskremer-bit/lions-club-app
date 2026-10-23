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
								{p.name}{#if p.deceased}
									<span aria-hidden="true">&nbsp;†</span><span class="sr-only">, verstorben</span
									>{/if}
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
	.muted {
		color: var(--text-secondary);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
</style>
