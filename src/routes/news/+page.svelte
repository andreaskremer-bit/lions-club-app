<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton } from '$lib/components/ui';
	import { ChevronLeft, Plus, Pin, Pencil } from '@lucide/svelte';
	import { linkify } from '$lib/news';

	let { data } = $props();
	let canManage = $derived((data.permissions ?? []).includes('publish_content'));

	const dateFmt = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});
</script>

<div class="shell">
	<AppBar title="News" eyebrow="Aktuelles" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
		{#snippet trailing()}
			{#if canManage}
				<IconButton label="Nachricht verfassen" onclick={() => goto(resolve('/news/neu'))}>
					{#snippet icon()}<Plus />{/snippet}
				</IconButton>
			{/if}
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#each data.posts as p (p.id)}
			<article class="post">
				<header class="post__head">
					<div class="post__titlerow">
						{#if p.pinned}<span class="post__pin"><Pin size={15} /></span>{/if}
						<h2 class="post__title">{p.title}</h2>
					</div>
					{#if canManage}
						<IconButton
							label="Bearbeiten"
							onclick={() => goto(resolve('/news/[id]/bearbeiten', { id: p.id }))}
						>
							{#snippet icon()}<Pencil size={18} />{/snippet}
						</IconButton>
					{/if}
				</header>
				<time class="post__date">{dateFmt.format(new Date(p.published_at))}</time>
				<!-- Klartext: Zeilen via <br>, URLs als externe Links (linkify). resolve()
				     gilt nur für app-interne Pfade -> Regel hier bewusst deaktiviert. -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<p class="post__body">
					{#each p.body.split('\n') as line, li (li)}
						{#if li > 0}<br />{/if}
						{#each linkify(line) as seg, si (si)}
							{#if seg.href}
								<a href={seg.href} target="_blank" rel="noopener noreferrer">{seg.text}</a>
							{:else}{seg.text}{/if}
						{/each}
					{/each}
				</p>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</article>
		{:else}
			<p class="empty">Noch keine Nachrichten.</p>
		{/each}
	</main>
</div>

<style>
	.post {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.post__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.post__titlerow {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}
	.post__pin {
		color: var(--gold-700);
		flex: none;
	}
	.post__title {
		font-size: var(--text-lg, 1.2rem);
		font-weight: 700;
		color: var(--text-strong);
		margin: 0;
	}
	.post__date {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.post__body {
		font-size: var(--text-base);
		color: var(--text-body);
		line-height: 1.5;
		margin: var(--space-1) 0 0;
	}
	.post__body a {
		color: var(--lions-blue, #1e4fa3);
		text-decoration: underline;
	}
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
</style>
