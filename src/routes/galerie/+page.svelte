<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import { AppBar, IconButton, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Images } from '@lucide/svelte';

	let { data } = $props();
	let canManage = $derived((data.permissions ?? []).includes('publish_content'));

	// Galerie-Ziel aus der Env (Netlify). Dynamic statt static: Build bricht nicht,
	// wenn die Variable fehlt.
	const galleryUrl = env.PUBLIC_GALLERY_URL ?? '';

	function openGallery() {
		if (galleryUrl) window.open(galleryUrl, '_blank', 'noopener,noreferrer');
	}
</script>

<div class="shell">
	<AppBar title="Galerie" eyebrow="Fotos" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<Card>
			<span class="gal__icon"><Images size={28} /></span>
			<p class="gal__text">
				Fotos von Club-Abenden, Reisen und Veranstaltungen liegen im geteilten Google-Drive des
				Clubs. Der Zugriff ist auf die Mitglieder freigegeben.
			</p>

			{#if galleryUrl}
				<Button onclick={openGallery}>
					{#snippet iconLeft()}<Images size={18} />{/snippet}
					Galerie öffnen
				</Button>
			{:else}
				<p class="gal__hint">
					Der Galerie-Link ist noch nicht hinterlegt.{#if canManage}
						Bitte die Umgebungsvariable <code>PUBLIC_GALLERY_URL</code> setzen.{/if}
				</p>
			{/if}
		</Card>
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
		gap: var(--space-4);
		padding: var(--screen-pad);
	}
	.gal__icon {
		color: var(--lions-blue, #1e4fa3);
		display: block;
	}
	.gal__text {
		font-size: var(--text-base);
		color: var(--text-body);
		line-height: 1.5;
		margin: var(--space-2) 0 var(--space-3);
	}
	.gal__hint {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}
	.gal__hint code {
		font-size: 0.95em;
		background: rgba(0, 0, 0, 0.06);
		padding: 1px 5px;
		border-radius: 4px;
	}
</style>
