<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Select, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Trash2 } from '@lucide/svelte';
	import {
		categoryOptions,
		MAX_FILE_BYTES,
		ACCEPTED_FILE_TYPES,
		type DocumentCategory
	} from '$lib/documents';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let canManage = $derived((data.permissions ?? []).includes('publish_content'));

	// Geladenes Dokument einmalig als Snapshot — das Formular soll sich nicht
	// reaktiv zurücksetzen, während der Nutzer es bearbeitet.
	const doc = untrack(() => data.doc);
	let title = $state(doc.title);
	let category = $state<DocumentCategory>(doc.category);
	let docDate = $state(doc.doc_date ?? '');
	let description = $state(doc.description ?? '');
	let eventId = $state(doc.event_id ?? '');
	let newFile = $state<File | null>(null);
	let busy = $state(false);
	let err = $state('');

	let eventOptions = $derived([
		{ value: '', label: '— keiner —' },
		...data.events.map((ev) => ({
			value: ev.id,
			label: `${eventFmt.format(new Date(ev.starts_at))} · ${ev.title}`
		}))
	]);

	const eventFmt = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});

	function onFile(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0] ?? null;
		if (f && f.size > MAX_FILE_BYTES) {
			err = 'Datei zu groß (max. 20 MB).';
			newFile = null;
			return;
		}
		err = '';
		newFile = f;
	}

	async function save() {
		if (busy || !canManage) return;
		if (!title.trim()) {
			err = 'Bitte einen Titel angeben.';
			return;
		}
		busy = true;
		err = '';

		const patch: Record<string, unknown> = {
			title: title.trim(),
			category,
			doc_date: docDate || null,
			description: description.trim() || null,
			event_id: eventId || null
		};

		// Datei ersetzen (optional).
		if (newFile) {
			const safeName = newFile.name.replace(/[^\w.-]+/g, '_');
			const path = `${doc.id}/${safeName}`;
			const { error: upErr } = await supabase.storage
				.from('documents')
				.upload(path, newFile, { contentType: newFile.type || undefined, upsert: true });
			if (upErr) {
				busy = false;
				err = 'Upload fehlgeschlagen: ' + upErr.message;
				return;
			}
			patch.file_path = path;
			patch.file_name = newFile.name;
			patch.mime_type = newFile.type || null;
			patch.size_bytes = newFile.size;
			patch.content_text = null; // wird neu extrahiert
		}

		const { error: updErr } = await supabase.from('document').update(patch).eq('id', doc.id);
		if (updErr) {
			busy = false;
			err = 'Speichern fehlgeschlagen: ' + updErr.message;
			return;
		}

		if (newFile) {
			supabase.functions.invoke('extract-document-text', { body: { id: doc.id } }).catch(() => {});
		}

		busy = false;
		await goto(resolve('/dokumente'), { invalidateAll: true });
	}

	async function remove() {
		if (busy || !canManage) return;
		if (!confirm('Dokument wirklich löschen?')) return;
		busy = true;
		err = '';
		if (doc.file_path) {
			await supabase.storage.from('documents').remove([doc.file_path]);
		}
		const { error: delErr } = await supabase.from('document').delete().eq('id', doc.id);
		busy = false;
		if (delErr) {
			err = 'Löschen fehlgeschlagen: ' + delErr.message;
			return;
		}
		await goto(resolve('/dokumente'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Dokument bearbeiten" eyebrow="Ablage" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/dokumente'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#if !canManage}
			<p class="err">Keine Berechtigung zum Bearbeiten von Dokumenten.</p>
		{:else}
			<Card>
				<Input label="Titel" bind:value={title} required />
				<Select label="Kategorie" options={categoryOptions} bind:value={category} />
				<Input label="Datum (Bezug)" type="date" bind:value={docDate} />
				<Input label="Beschreibung" multiline bind:value={description} />
				<Select label="Termin (optional)" options={eventOptions} bind:value={eventId} />
			</Card>

			<Card>
				<span class="field__label">Datei {doc.file_name ? `(aktuell: ${doc.file_name})` : ''}</span>
				<label class="filepick">
					<input type="file" accept={ACCEPTED_FILE_TYPES} onchange={onFile} disabled={busy} />
					<span>{newFile ? newFile.name : 'Datei ersetzen (optional)'}</span>
				</label>
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
	.field__label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-strong);
	}
	.filepick {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 44px;
		cursor: pointer;
		font-size: var(--text-base);
		color: var(--text-body);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
