<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Checkbox, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Trash2 } from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let canManage = $derived((data.permissions ?? []).includes('publish_content'));

	const post = untrack(() => data.post);
	let title = $state(post.title);
	let body = $state(post.body);
	let pinned = $state(post.pinned);
	let busy = $state(false);
	let err = $state('');

	async function save() {
		if (busy || !canManage) return;
		if (!title.trim() || !body.trim()) {
			err = 'Bitte Titel und Text angeben.';
			return;
		}
		busy = true;
		err = '';
		const { error: updErr } = await supabase
			.from('news_post')
			.update({ title: title.trim(), body: body.trim(), pinned })
			.eq('id', post.id);
		busy = false;
		if (updErr) {
			err = 'Speichern fehlgeschlagen: ' + updErr.message;
			return;
		}
		await goto(resolve('/news'), { invalidateAll: true });
	}

	async function remove() {
		if (busy || !canManage) return;
		if (!confirm('Nachricht wirklich löschen?')) return;
		busy = true;
		err = '';
		const { error: delErr } = await supabase.from('news_post').delete().eq('id', post.id);
		busy = false;
		if (delErr) {
			err = 'Löschen fehlgeschlagen: ' + delErr.message;
			return;
		}
		await goto(resolve('/news'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Nachricht bearbeiten" eyebrow="Aktuelles" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/news'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#if !canManage}
			<p class="err">Keine Berechtigung zum Bearbeiten von Nachrichten.</p>
		{:else}
			<Card>
				<Input label="Titel" bind:value={title} required />
				<Input label="Text" multiline bind:value={body} required />
				<Checkbox label="Oben anpinnen" bind:checked={pinned} />
			</Card>

			{#if err}<p class="err">{err}</p>{/if}

			<Button fullWidth disabled={busy} onclick={save}>{busy ? 'Speichern …' : 'Speichern'}</Button>
			<Button variant="ghost" disabled={busy} onclick={remove}>
				{#snippet iconLeft()}<Trash2 size={18} />{/snippet}
				Löschen
			</Button>
		{/if}
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
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
