<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, Card, Button, IconButton } from '$lib/components/ui';
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
		Images
	} from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let email = $derived(data.user?.email ?? '');

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
		<Card>
			<h2 class="welcome__h">Angemeldet</h2>
			<p class="welcome__p">
				Du bist als <strong>{email}</strong> angemeldet. Das Fundament (M0) steht: Design-System, self-hosted
				Schriften, Supabase-Auth per E-Mail-Code.
			</p>
			<p class="welcome__hint">Die Module Termine, Mitglieder und mehr folgen ab M1.</p>
		</Card>

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
	.welcome__h {
		font-size: var(--text-lg);
		margin-bottom: var(--space-2);
	}
	.welcome__p {
		font-size: var(--text-base);
		color: var(--text-body);
		line-height: var(--leading-normal);
	}
	.welcome__p strong {
		color: var(--text-strong);
	}
	.welcome__hint {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin-top: var(--space-3);
	}
</style>
