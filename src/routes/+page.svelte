<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, Button, IconButton } from '$lib/components/ui';
	import {
		LogOut,
		Users,
		CalendarDays,
		Cake,
		BarChart3,
		ArrowRight,
		Bell,
		FileText,
		Newspaper,
		Images,
		Award
	} from '@lucide/svelte';

	import type { EventType } from './termine/+page';

	let { data } = $props();
	let supabase = $derived(data.supabase);

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

	let loading = $state(false);

	async function signOut() {
		loading = true;
		await supabase.auth.signOut();
		await goto(resolve('/login'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Lions Club Bonn-Rheinaue" eyebrow="Clubverwaltung" bordered>
		{#snippet trailing()}
			<div class="appbar-actions">
				<button
					class="bell"
					aria-label="Benachrichtigungen"
					onclick={() => goto(resolve('/benachrichtigungen'))}
				>
					<Bell size={22} />
					{#if data.unread > 0}<span class="bell__badge">{data.unread}</span>{/if}
				</button>
				<IconButton label="Abmelden" onclick={signOut} disabled={loading}>
					{#snippet icon()}<LogOut />{/snippet}
				</IconButton>
			</div>
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
			onclick={() =>
				latestNews ? goto(resolve('/news/[id]', { id: latestNews.id })) : goto(resolve('/news'))}
		>
			<span class="hero__eyebrow"><Newspaper size={15} /> Neueste News</span>
			{#if latestNews}
				<span class="hero__title">{latestNews.title}</span>
				<span class="hero__snippet">{newsSnippet(latestNews.body)}</span>
			{:else}
				<span class="hero__meta">Noch keine Nachrichten.</span>
			{/if}
		</button>

		<Button fullWidth onclick={() => goto(resolve('/termine'))}>
			{#snippet iconLeft()}<CalendarDays size={18} />{/snippet}
			Termine
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/news'))}>
			{#snippet iconLeft()}<Newspaper size={18} />{/snippet}
			News
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/mitglieder'))}>
			{#snippet iconLeft()}<Users size={18} />{/snippet}
			Mitgliederverzeichnis
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/geburtstage'))}>
			{#snippet iconLeft()}<Cake size={18} />{/snippet}
			Geburtstage
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/galerie'))}>
			{#snippet iconLeft()}<Images size={18} />{/snippet}
			Galerie
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/dokumente'))}>
			{#snippet iconLeft()}<FileText size={18} />{/snippet}
			Dokumente
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		{#if data.permissions.includes('view_donations')}
			<Button variant="secondary" fullWidth onclick={() => goto(resolve('/auswertung'))}>
				{#snippet iconLeft()}<BarChart3 size={18} />{/snippet}
				Auswertung (Schatzmeister)
				{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
			</Button>
		{/if}

		{#if data.permissions.includes('manage_roles')}
			<Button variant="secondary" fullWidth onclick={() => goto(resolve('/vorstand'))}>
				{#snippet iconLeft()}<Award size={18} />{/snippet}
				Vorstand & Ämter
				{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
			</Button>
		{/if}

		<Button variant="secondary" fullWidth onclick={signOut} disabled={loading}>
			{loading ? 'Abmelden …' : 'Abmelden'}
			{#snippet iconRight()}<LogOut size={18} />{/snippet}
		</Button>
	</main>
</div>

<style>
	.appbar-actions {
		display: flex;
		align-items: center;
		gap: var(--space-1);
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
		gap: var(--space-4);
		padding: var(--screen-pad);
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
