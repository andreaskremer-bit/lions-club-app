<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, Button } from '$lib/components/ui';
	import { clearPrivateCaches } from '$lib/offlineCache';
	import { releasePushOnSignOut } from '$lib/push';
	import { APP_BUILD } from '$lib/version';
	import {
		User,
		Cake,
		FileText,
		Images,
		Bell,
		BarChart3,
		Award,
		Download,
		LogOut,
		ArrowRight
	} from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let permissions = $derived(data.permissions ?? []);

	let loading = $state(false);

	async function signOut() {
		loading = true;
		// Push-Abo zuerst beenden: das Löschen der Zeile braucht noch die Sitzung.
		await releasePushOnSignOut(supabase);
		await supabase.auth.signOut();
		// Gecachte Mitgliederfotos sind personenbezogen – beim Abmelden weg (DSGVO).
		await clearPrivateCaches();
		await goto(resolve('/login'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Mehr" eyebrow="Übersicht" large bordered />

	<main class="shell__body">
		{#if data.memberId}
			<Button
				variant="secondary"
				fullWidth
				onclick={() => goto(resolve('/mitglieder/[id]', { id: data.memberId! }))}
			>
				{#snippet iconLeft()}<User size={18} />{/snippet}
				Mein Profil
				{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
			</Button>
		{/if}

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/geburtstage'))}>
			{#snippet iconLeft()}<Cake size={18} />{/snippet}
			Geburtstage
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/dokumente'))}>
			{#snippet iconLeft()}<FileText size={18} />{/snippet}
			Dokumente
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/galerie'))}>
			{#snippet iconLeft()}<Images size={18} />{/snippet}
			Galerie
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		<Button variant="secondary" fullWidth onclick={() => goto(resolve('/benachrichtigungen'))}>
			{#snippet iconLeft()}<Bell size={18} />{/snippet}
			Benachrichtigungen{#if data.unread > 0}&nbsp;({data.unread}){/if}
			{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
		</Button>

		{#if permissions.includes('view_donations')}
			<Button variant="secondary" fullWidth onclick={() => goto(resolve('/auswertung'))}>
				{#snippet iconLeft()}<BarChart3 size={18} />{/snippet}
				Auswertung (Schatzmeister)
				{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
			</Button>
		{/if}

		{#if permissions.includes('manage_roles')}
			<Button variant="secondary" fullWidth onclick={() => goto(resolve('/vorstand'))}>
				{#snippet iconLeft()}<Award size={18} />{/snippet}
				Vorstand & Ämter
				{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
			</Button>
		{/if}

		{#if permissions.includes('export_lions')}
			<Button variant="secondary" fullWidth onclick={() => goto(resolve('/mitglieder/export'))}>
				{#snippet iconLeft()}<Download size={18} />{/snippet}
				Lions-Export
				{#snippet iconRight()}<ArrowRight size={18} />{/snippet}
			</Button>
		{/if}

		<div class="logout">
			<Button variant="ghost" fullWidth disabled={loading} onclick={signOut}>
				{#snippet iconLeft()}<LogOut size={18} />{/snippet}
				{loading ? 'Ausloggen …' : 'Ausloggen'}
			</Button>
		</div>

		<!-- Leise Fußzeile: für Mitglieder Beiwerk, im Supportfall die erste Frage
		     ("hast du den aktuellen Stand?"). Tippbar -> Was ist neu.
		     Commit-Hash bewusst mit dabei: er macht die Zeile neugierig genug zum
		     Antippen und ordnet einen Screenshot exakt einem Code-Stand zu. -->
		<a class="version" href={resolve('/mehr/version')}>
			Version {APP_BUILD}
		</a>
	</main>
</div>

<style>
	.shell__body {
		gap: var(--space-3);
	}
	.logout {
		margin-top: var(--space-3);
	}
	.version {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 44px; /* Touch-Ziel */
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		text-decoration: none;
	}
	.version:hover,
	.version:focus-visible {
		color: var(--text-body);
		text-decoration: underline;
	}
</style>
