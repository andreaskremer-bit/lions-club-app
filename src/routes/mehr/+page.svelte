<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, Button } from '$lib/components/ui';
	import {
		User,
		Cake,
		FileText,
		Images,
		Bell,
		BarChart3,
		Award,
		LogOut,
		ArrowRight
	} from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let permissions = $derived(data.permissions ?? []);

	let loading = $state(false);

	async function signOut() {
		loading = true;
		await supabase.auth.signOut();
		await goto(resolve('/login'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Mehr" eyebrow="Übersicht" bordered />

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

		<div class="logout">
			<Button variant="ghost" fullWidth disabled={loading} onclick={signOut}>
				{#snippet iconLeft()}<LogOut size={18} />{/snippet}
				{loading ? 'Ausloggen …' : 'Ausloggen'}
			</Button>
		</div>
	</main>
</div>

<style>
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
		gap: var(--space-3);
		padding: var(--screen-pad);
	}
	.logout {
		margin-top: var(--space-3);
	}
</style>
