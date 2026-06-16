<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar } from '$lib/components/ui';
	import { CalendarDays, Bell, Newspaper } from '@lucide/svelte';

	import type { EventType } from './termine/+page';

	let { data } = $props();

	let nextEvent = $derived(data.nextEvent);
	let latestNews = $derived(data.latestNews);

	const typeLabel: Record<EventType, string> = {
		clubabend: 'Club-Abend',
		versammlung: 'Mitglieder-Versammlung',
		reise: 'Club-Reise',
		gesellig: 'Gesellig',
		lions_termin: 'Lions-Termin'
	};
	const eventDateFmt = new Intl.DateTimeFormat('de-DE', {
		weekday: 'short',
		day: '2-digit',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit'
	});
	function newsSnippet(body: string): string {
		const flat = body.replace(/\s+/g, ' ').trim();
		return flat.length > 140 ? flat.slice(0, 140).trimEnd() + ' …' : flat;
	}
</script>

<div class="shell">
	<AppBar title="Bonn-Rheinaue" eyebrow="Lions Club" large bordered>
		{#snippet leading()}
			<img class="appbar-emblem" src="/icons/lions-emblem.png" alt="" />
		{/snippet}
		{#snippet trailing()}
			<button
				class="bell"
				aria-label="Benachrichtigungen"
				onclick={() => goto(resolve('/benachrichtigungen'))}
			>
				<Bell size={22} />
				{#if data.unread > 0}<span class="bell__badge">{data.unread}</span>{/if}
			</button>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<button
			class="hero"
			class:hero--empty={!nextEvent}
			onclick={() =>
				nextEvent
					? goto(resolve('/termine/[id]', { id: nextEvent.id }))
					: goto(resolve('/termine'))}
		>
			<span class="hero__eyebrow"><CalendarDays size={15} /> Nächster Termin</span>
			{#if nextEvent}
				<span class="hero__title">{nextEvent.title}</span>
				<span class="hero__meta">{eventDateFmt.format(new Date(nextEvent.starts_at))} Uhr</span>
				<span class="hero__tags">
					<span class="hero__badge">{typeLabel[nextEvent.type]}</span>
					{#if nextEvent.location}<span class="hero__loc">{nextEvent.location}</span>{/if}
				</span>
			{:else}
				<span class="hero__meta">Aktuell ist kein kommender Termin geplant.</span>
			{/if}
		</button>

		<button
			class="hero"
			class:hero--empty={!latestNews}
			onclick={() => goto(resolve('/news'))}
		>
			<span class="hero__eyebrow"><Newspaper size={15} /> Neueste News</span>
			{#if latestNews}
				<span class="hero__title">{latestNews.title}</span>
				<span class="hero__snippet">{newsSnippet(latestNews.body)}</span>
			{:else}
				<span class="hero__meta">Noch keine Nachrichten.</span>
			{/if}
		</button>
	</main>
</div>

<style>
	.appbar-emblem {
		width: 32px;
		height: 32px;
		object-fit: contain;
		display: block;
	}
	.bell {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: none;
		color: var(--text-strong);
		cursor: pointer;
	}
	.bell__badge {
		position: absolute;
		top: 4px;
		right: 2px;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		border-radius: 9px;
		background: var(--clay, #b4502f);
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.hero {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: 100%;
		text-align: left;
		padding: var(--space-4);
		background: var(--surface, #fff);
		border: 1px solid var(--hairline, rgba(30, 79, 163, 0.16));
		border-radius: var(--radius-lg, 14px);
		cursor: pointer;
		color: inherit;
		font: inherit;
	}
	.hero--empty {
		cursor: default;
	}
	.hero__eyebrow {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--lions-blue, #1e4fa3);
	}
	.hero__title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--text-strong);
		line-height: var(--leading-tight, 1.25);
	}
	.hero__meta {
		font-size: var(--text-base);
		color: var(--text-body);
	}
	.hero__snippet {
		font-size: var(--text-base);
		color: var(--text-body);
		line-height: var(--leading-normal);
	}
	.hero__tags {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}
	.hero__badge {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--lions-blue, #1e4fa3);
		background: rgba(30, 79, 163, 0.1);
		padding: 2px 8px;
		border-radius: 999px;
	}
	.hero__loc {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
</style>
