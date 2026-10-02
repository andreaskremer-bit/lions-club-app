<script lang="ts">
	import '$lib/styles/fonts'; // self-hosted Schriften (DSGVO: kein Google-Fonts-CDN)
	import '$lib/styles/app.css'; // Design-Tokens "Lions 2.0"
	import { beforeNavigate, goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page, updated } from '$app/state';
	import { onMount } from 'svelte';
	import { Button, HintCard, TabBar, type TabItem } from '$lib/components/ui';
	import { trackDisplayMode } from '$lib/displayMode';
	import type { ChangelogEntry } from '$lib/changelog';
	import { markChangelogSeen, readSeen, storageAvailable, unseenEntries } from '$lib/whatsNew';
	import {
		House,
		CalendarDays,
		Users,
		Newspaper,
		Ellipsis,
		RefreshCw,
		Sparkles
	} from '@lucide/svelte';

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

	// Neue Version ausgeliefert (SvelteKit-Versionspoll, s. `version` in
	// vite.config.ts): Die nächste Navigation wird zu einem vollen Seitenaufruf,
	// damit frisches HTML und die neuen Build-Dateien geladen werden. Bewusst
	// nicht sofort neu laden — das würde jemanden mitten im Formular unterbrechen.
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});
	// „Später“ blendet nur den Hinweis aus; der volle Seitenaufruf bei der
	// nächsten Navigation bleibt, damit niemand dauerhaft alten Code fährt.
	let updateHintDismissed = $state(false);

	// „Neu in der App“: nach einem Update einmal pro Gerät zeigen, was sich laut
	// Changelog geändert hat (Logik in $lib/whatsNew). Wer „Was ist neu“ selbst
	// öffnet, hat es gesehen.
	let whatsNew = $state<ChangelogEntry[]>([]);
	let whatsNewChanges = $derived(whatsNew.flatMap((entry) => entry.changes));
	function dismissWhatsNew() {
		markChangelogSeen();
		whatsNew = [];
	}
	$effect(() => {
		if (page.url.pathname === '/mehr/version' && whatsNew.length) dismissWhatsNew();
	});

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
		// Service Worker aktiv registrieren. vite-pwa injiziert die Registrierung unter
		// SvelteKit/adapter-netlify NICHT ins HTML -> ohne dies bleibt der SW inaktiv,
		// `navigator.serviceWorker.ready` (siehe Push-Aktivierung) hängt und der
		// Aktivieren-Button bleibt grau. registerType:'autoUpdate' im generierten SW
		// übernimmt skipWaiting/clientsClaim, daher genügt ein direkter register('/sw.js').
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(() => {});
		}

		// Kommt ein Tab nach Tagen wieder in den Vordergrund, sofort nachsehen statt
		// auf den nächsten Poll-Tick zu warten: Versionsdatei UND Service Worker.
		// Der Browser prüft die sw.js von sich aus nur bei vollen Seitenaufrufen
		// und Push-Ereignissen — beides fehlt in einem dauerhaft offenen Tab.
		const checkForUpdate = () => {
			if (document.visibilityState !== 'visible') return;
			updated.check().catch(() => {});
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker
					.getRegistration()
					.then((reg) => reg?.update())
					.catch(() => {});
			}
		};
		document.addEventListener('visibilitychange', checkForUpdate);

		if (storageAvailable()) whatsNew = unseenEntries(readSeen());

		// Einmal pro App-Start vermerken, ob die installierte PWA oder der Browser
		// genutzt wird (Homescreen-Quote). Fire-and-forget, siehe displayMode.ts.
		if (data.user) trackDisplayMode(supabase);

		const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
			// Beim Anmelden bleibt das Root-Layout montiert (Client-Navigation), der
			// onMount-Aufruf oben lief da noch ohne Session — hier nachholen.
			// 'INITIAL_SESSION' ist der Ladefall und deshalb bewusst nicht dabei.
			if (event === 'SIGNED_IN') trackDisplayMode(supabase);

			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => {
			sub.subscription.unsubscribe();
			document.removeEventListener('visibilitychange', checkForUpdate);
		};
	});
</script>

<div class:has-tabbar={showTabBar}>
	{@render children()}
</div>

{#if updated.current && !updateHintDismissed}
	<div class="app-update" class:app-update--above-tabbar={showTabBar}>
		<HintCard title="Neue Version verfügbar" tone="info">
			{#snippet icon()}<RefreshCw aria-hidden="true" />{/snippet}
			Die App wurde aktualisiert. Lade sie neu, um den aktuellen Stand zu nutzen.
			{#snippet action()}
				<div class="app-update__actions">
					<Button size="sm" onclick={() => location.reload()}>Jetzt neu laden</Button>
					<Button size="sm" variant="ghost" onclick={() => (updateHintDismissed = true)}>
						Später
					</Button>
				</div>
			{/snippet}
		</HintCard>
	</div>
{/if}

{#if showTabBar && whatsNewChanges.length && !updated.current}
	<div class="app-update app-update--above-tabbar">
		<HintCard title="Neu in der App" tone="info">
			{#snippet icon()}<Sparkles aria-hidden="true" />{/snippet}
			{#if whatsNewChanges.length === 1}
				{whatsNewChanges[0].text}
			{:else}
				Seit deinem letzten Besuch gibt es {whatsNewChanges.length} Neuerungen.
			{/if}
			{#snippet action()}
				<div class="app-update__actions">
					<Button size="sm" onclick={() => goto(resolve('/mehr/version'))}>Was ist neu?</Button>
					<Button size="sm" variant="ghost" onclick={dismissWhatsNew}>Schließen</Button>
				</div>
			{/snippet}
		</HintCard>
	</div>
{/if}

{#if showTabBar}
	<div class="app-tabbar">
		<TabBar items={tabs} value={activeTab} />
	</div>
{/if}

<style>
	/* Update-Hinweis: fest über dem Seiteninhalt, bei sichtbarer TabBar darüber. */
	.app-update {
		position: fixed;
		bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
		left: 0;
		right: 0;
		max-width: var(--content-max);
		margin-inline: auto;
		padding-inline: var(--screen-pad);
		z-index: 51;
		transform: translateZ(0);
	}
	.app-update__actions {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}
	.app-update--above-tabbar {
		bottom: calc(var(--tabbar-h) + var(--space-3) + env(safe-area-inset-bottom, 0px));
	}

	.app-tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-width: var(--content-max);
		margin-inline: auto;
		z-index: 50;
		/* WebKit-Bug in installierten iOS-PWAs: fixe Elemente wandern beim Scrollen
		   zeitweise mit dem Inhalt mit. Eigene Compositing-Ebene erzwingen, damit
		   die Leiste unabhängig vom Seiteninhalt gezeichnet wird. */
		transform: translateZ(0);
	}
</style>
