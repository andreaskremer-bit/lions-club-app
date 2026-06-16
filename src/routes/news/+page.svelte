<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton } from '$lib/components/ui';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import { Plus } from '@lucide/svelte';

	let { data } = $props();
	let canManage = $derived((data.permissions ?? []).includes('publish_content'));
</script>

<div class="shell">
	<AppBar title="News" eyebrow="Vereinsnachrichten" large bordered>
		{#snippet trailing()}
			{#if canManage}
				<IconButton
					label="Nachricht verfassen"
					tone="primary"
					onclick={() => goto(resolve('/news/neu'))}
				>
					{#snippet icon()}<Plus />{/snippet}
				</IconButton>
			{/if}
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#each data.posts as p (p.id)}
			<NewsCard {...p} {canManage} />
		{:else}
			<p class="empty">Noch keine Nachrichten.</p>
		{/each}
	</main>
</div>

<style>
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
</style>
