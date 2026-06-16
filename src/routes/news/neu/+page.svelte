<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Checkbox, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Send } from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let title = $state('');
	let body = $state('');
	let pinned = $state(false);
	let notify = $state(true);
	let busy = $state(false);
	let err = $state('');

	async function publish() {
		if (busy) return;
		if (!title.trim() || !body.trim()) {
			err = 'Bitte Titel und Text angeben.';
			return;
		}
		busy = true;
		err = '';

		const { data: created, error: insErr } = await supabase
			.from('news_post')
			.insert({ title: title.trim(), body: body.trim(), pinned, published_by: data.memberId })
			.select('id')
			.single();
		if (insErr || !created) {
			busy = false;
			err = 'Veröffentlichen fehlgeschlagen: ' + (insErr?.message ?? 'unbekannt');
			return;
		}

		if (notify) {
			await supabase.rpc('notify_news', { p_news_post_id: created.id });
		}

		busy = false;
		await goto(resolve('/news'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Nachricht verfassen" eyebrow="Aktuelles" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/news'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<Card>
			<Input label="Titel" bind:value={title} required />
			<Input label="Text" multiline bind:value={body} required />
			<Checkbox label="Oben anpinnen" bind:checked={pinned} />
			<Checkbox label="Mitglieder benachrichtigen" bind:checked={notify} />
		</Card>

		{#if err}<p class="err">{err}</p>{/if}

		<Button fullWidth disabled={busy} onclick={publish}>
			{#snippet iconLeft()}<Send size={18} />{/snippet}
			{busy ? 'Veröffentlichen …' : 'Veröffentlichen'}
		</Button>
	</main>
</div>

<style>
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
