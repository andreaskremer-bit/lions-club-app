<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, Button, IconButton, Input, FilePicker } from '$lib/components/ui';
	import { Download, Trash2, Plus } from '@lucide/svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { uploadDocument, MAX_FILE_BYTES, type DocumentRow } from '$lib/documents';

	let {
		supabase,
		eventId,
		canManage = false,
		memberId = null
	}: {
		supabase: SupabaseClient;
		eventId: string;
		canManage?: boolean;
		memberId?: string | null;
	} = $props();

	const COLS =
		'id, title, category, doc_date, description, event_id, file_path, file_name, created_at';

	let docs = $state<DocumentRow[]>([]);
	let loaded = $state(false);
	let busy = $state(false);
	let err = $state('');

	// Upload-Formular (nur für Verwalter sichtbar). Kategorie ist für Termin-Anhänge
	// ohne Bedeutung (sie tauchen nicht in der Ablage /dokumente auf) → fest "sonstige".
	let showForm = $state(false);
	let title = $state('');
	let file = $state<File | null>(null);

	async function refresh() {
		const { data } = await supabase
			.from('document')
			.select(COLS)
			.eq('event_id', eventId)
			.order('created_at', { ascending: false });
		docs = (data ?? []) as DocumentRow[];
		loaded = true;
	}
	onMount(refresh);

	async function download(d: DocumentRow) {
		if (!d.file_path) return;
		const { data: signed } = await supabase.storage
			.from('documents')
			.createSignedUrl(d.file_path, 60);
		if (signed?.signedUrl) window.open(signed.signedUrl, '_blank');
	}

	function onFile(f: File | null) {
		if (f && f.size > MAX_FILE_BYTES) {
			err = 'Datei zu groß (max. 20 MB).';
			file = null;
			return;
		}
		err = '';
		file = f;
		// Titel aus dem Dateinamen vorbelegen, solange noch keiner getippt wurde.
		if (f && !title.trim()) title = f.name.replace(/\.[^.]+$/, '');
	}

	async function add() {
		if (busy) return;
		if (!file) {
			err = 'Bitte eine Datei wählen.';
			return;
		}
		busy = true;
		err = '';
		const res = await uploadDocument(supabase, {
			file,
			title: title.trim() || file.name,
			category: 'sonstige',
			eventId,
			memberId
		});
		busy = false;
		if ('error' in res) {
			err = res.error;
			return;
		}
		file = null;
		title = '';
		showForm = false;
		await refresh();
	}

	async function remove(d: DocumentRow) {
		if (busy || !confirm('Dokument wirklich löschen?')) return;
		busy = true;
		err = '';
		if (d.file_path) await supabase.storage.from('documents').remove([d.file_path]);
		const { error } = await supabase.from('document').delete().eq('id', d.id);
		busy = false;
		if (error) {
			err = error.message;
			return;
		}
		await refresh();
	}
</script>

<!-- Leeren Zustand nur Verwaltern zeigen (sonst kein Mehrwert). -->
{#if loaded && (docs.length > 0 || canManage)}
	<Card>
		<h2 class="sec">Dokumente</h2>

		{#if docs.length}
			<ul class="docs">
				{#each docs as d (d.id)}
					<li class="doc">
						<button class="doc__main" onclick={() => download(d)} disabled={!d.file_path}>
							<Download size={18} />
							<span class="doc__title">{d.title}</span>
						</button>
						{#if canManage}
							<IconButton label="Löschen" onclick={() => remove(d)} disabled={busy}>
								{#snippet icon()}<Trash2 size={18} />{/snippet}
							</IconButton>
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="muted">Noch keine Dokumente angehängt.</p>
		{/if}

		{#if canManage}
			{#if showForm}
				<div class="form">
					<FilePicker {file} disabled={busy} onpick={onFile} />
					<Input label="Titel" bind:value={title} />
					<div class="form__actions">
						<Button disabled={busy || !file} onclick={add}>
							{busy ? 'Lädt …' : 'Hinzufügen'}
						</Button>
						<Button variant="ghost" disabled={busy} onclick={() => (showForm = false)}>
							Abbrechen
						</Button>
					</div>
				</div>
			{:else}
				<Button variant="secondary" onclick={() => (showForm = true)}>
					{#snippet iconLeft()}<Plus size={18} />{/snippet}
					Dokument hinzufügen
				</Button>
			{/if}
		{/if}

		{#if err}<p class="err">{err}</p>{/if}
	</Card>
{/if}

<style>
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-3);
	}
	.docs {
		list-style: none;
		margin: 0 0 var(--space-3);
		padding: 0;
	}
	.doc {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) 0;
	}
	.doc__main {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 44px;
		padding: 0;
		background: none;
		border: 0;
		cursor: pointer;
		color: var(--accent, #1e4fa3);
		text-align: left;
		font-size: var(--text-base);
	}
	.doc__main:disabled {
		color: var(--text-secondary);
		cursor: default;
	}
	.doc__title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.form__actions {
		display: flex;
		gap: var(--space-2);
	}
	.muted {
		color: var(--text-secondary);
		font-size: var(--text-sm);
		margin: 0 0 var(--space-3);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-sm);
		margin: var(--space-2) 0 0;
	}
</style>
