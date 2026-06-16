<script lang="ts">
	import '$lib/styles/fonts'; // self-hosted Schriften (DSGVO: kein Google-Fonts-CDN)
	import '$lib/styles/app.css'; // Design-Tokens "Lions 2.0"
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { TabBar, type TabItem } from '$lib/components/ui';
	import { House, CalendarDays, Users, Newspaper, Ellipsis } from '@lucide/svelte';

	let { data, children } = $props();
	let supabase = $derived(data.supabase);
	let session = $derived(data.session);

	// Bottom-Navigation nur für eingeloggte Nutzer, nicht auf dem Login-Screen.
	let showTabBar = $derived(!!session && page.url.pathname !== '/login');

	// Aktiver Tab aus dem ersten Pfadsegment; alle Sekundär-Bereiche zählen zu "Mehr".
	function tabForPath(p: string): string {
		if (p === '/') return 'start';
		if (p.startsWith('/termine')) return 'termine';
		if (p.startsWith('/mitglieder')) return 'mitglieder';
		if (p.startsWith('/news')) return 'news';
		return 'mehr';
	}
	let activeTab = $derived(tabForPath(page.url.pathname));

	let tabs = $derived<TabItem[]>([
		{ id: 'start', label: 'Start', icon: House, href: resolve('/') },
		{ id: 'termine', label: 'Termine', icon: CalendarDays, href: resolve('/termine') },
		{ id: 'mitglieder', label: 'Mitglieder', icon: Users, href: resolve('/mitglieder') },
		{ id: 'news', label: 'News', icon: Newspaper, href: resolve('/news') },
		{
			id: 'mehr',
			label: 'Mehr',
			icon: Ellipsis,
			href: resolve('/mehr'),
			badge: data.unread || undefined
		}
	]);

	// Auth-Statusänderungen (Login/Logout/Token-Refresh) spiegeln und Daten neu laden.
	onMount(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => sub.subscription.unsubscribe();
	});
</script>

<div class:has-tabbar={showTabBar}>
	{@render children()}
</div>

{#if showTabBar}
	<div class="app-tabbar">
		<TabBar items={tabs} value={activeTab} />
	</div>
{/if}

<style>
	.app-tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-width: var(--content-max);
		margin-inline: auto;
		z-index: 50;
	}
</style>
