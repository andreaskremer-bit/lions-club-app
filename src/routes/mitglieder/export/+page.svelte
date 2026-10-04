<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Download } from '@lucide/svelte';
	import { buildMemberCsv, exportFilename } from '$lib/lionsExport';
	import { downloadCsv } from '$lib/csv';

	let { data } = $props();
	let canExport = $derived((data.permissions ?? []).includes('export_lions'));
	let members = $derived(data.members);

	function download() {
		downloadCsv([buildMemberCsv(members)], exportFilename());
	}
</script>

<div class="shell">
	<AppBar title="Lions-Export" eyebrow="Mitglieder" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mehr'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#if !canExport}
			<p class="err">Keine Berechtigung für den Lions-Export.</p>
		{:else}
			<Card>
				<h2 class="sec">Mitgliederdaten exportieren</h2>
				<p class="muted">
					Erzeugt eine CSV-Datei aller {members.length} Mitglieder (Name, Status, Kontakt, Adresse, Geburts-
					und Eintrittsdatum) für die Meldung an Lions Deutschland. Die Datei lässt sich in Excel öffnen.
				</p>
				<Button fullWidth disabled={members.length === 0} onclick={download}>
					{#snippet iconLeft()}<Download size={18} />{/snippet}
					CSV herunterladen
				</Button>
			</Card>
		{/if}
	</main>
</div>

<style>
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-3);
	}
	.muted {
		font-size: var(--text-base);
		color: var(--text-body);
		line-height: var(--leading-normal);
		margin: 0 0 var(--space-4);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
