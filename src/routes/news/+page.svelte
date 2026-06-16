<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Avatar } from '$lib/components/ui';
	import { Plus, Pin, Pencil } from '@lucide/svelte';
	import { linkify } from '$lib/news';
	import type { NewsFeedItem } from './+page';

	let { data } = $props();
	let canManage = $derived((data.permissions ?? []).includes('publish_content'));

	const dateFmt = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});

	/** Relative Zeit auf Deutsch; älter als eine Woche → Datum. */
	function relTime(iso: string): string {
		const d = new Date(iso);
		const sec = (Date.now() - d.getTime()) / 1000;
		if (sec < 90) return 'gerade eben';
		if (sec < 3600) return `vor ${Math.floor(sec / 60)} Min.`;
		if (sec < 86400) return `vor ${Math.floor(sec / 3600)} Std.`;
		const days = Math.floor(sec / 86400);
		if (days === 1) return 'gestern';
		if (days < 7) return `vor ${days} Tagen`;
		return dateFmt.format(d);
	}

	function avatarTone(id: string): 'blue' | 'gold' | 'cream' {
		let h = 0;
		for (const c of id) h = (h + c.charCodeAt(0)) % 3;
		return (['blue', 'gold', 'cream'] as const)[h];
	}

	const sub = (p: NewsFeedItem) =>
		[p.authorRole, relTime(p.published_at)].filter(Boolean).join(' · ');
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
			<article class="post">
				<header class="post__head">
					<Avatar name={p.authorName ?? 'Vorstand'} size="md" tone={avatarTone(p.id)} />
					<div class="post__by">
						<span class="post__author">{p.authorName ?? 'Vorstand'}</span>
						<span class="post__sub">{sub(p)}</span>
					</div>
					<div class="post__actions">
						{#if p.pinned}<span class="post__pin" aria-label="Angepinnt"><Pin size={16} /></span
							>{/if}
						{#if canManage}
							<IconButton
								label="Bearbeiten"
								onclick={() => goto(resolve('/news/[id]/bearbeiten', { id: p.id }))}
							>
								{#snippet icon()}<Pencil size={18} />{/snippet}
							</IconButton>
						{/if}
					</div>
				</header>

				<h2 class="post__title">{p.title}</h2>

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
		gap: var(--space-3);
		background: var(--surface-card);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}
	.post__head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.post__by {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}
	.post__author {
		font-size: var(--text-base);
		font-weight: var(--fw-bold);
		color: var(--text-strong);
		line-height: 1.2;
	}
	.post__sub {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.post__actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex: none;
	}
	.post__pin {
		display: inline-flex;
		color: var(--gold-700);
	}
	.post__title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--fw-semibold);
		color: var(--text-strong);
		line-height: var(--leading-tight);
		margin: 0;
	}
	.post__body {
		font-size: var(--text-base);
		color: var(--text-body);
		line-height: var(--leading-normal);
		margin: 0;
	}
	.post__body a {
		color: var(--text-link);
		text-decoration: underline;
	}
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
</style>
