<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Plus } from '@lucide/svelte';
	import {
		categoryOptions,
		notifyByDefault,
		MAX_FILE_BYTES,
		ACCEPTED_FILE_TYPES,
		type DocumentCategory
	} from '$lib/documents';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let title = $state('');
	let category = $state<DocumentCategory>('protokoll_clubabend');
	let docDate = $state('');
	let description = $state('');
	let eventId = $state('');
	let notify = $state(true);
	let file = $state<File | null>(null);
	let busy = $state(false);
	let err = $state('');

	const eventFmt = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});

	function onCategory(e: Event) {
		category = (e.target as HTMLSelectElement).value as DocumentCategory;
		// Vorschlag: bei Protokollen Benachrichtigung vorbelegen (überschreibbar).
		notify = notifyByDefault.includes(category);
	}

	function onFile(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0] ?? null;
		if (f && f.size > MAX_FILE_BYTES) {
			err = 'Datei zu groß (max. 20 MB).';
			file = null;
			return;
		}
		err = '';
		file = f;
	}

	async function save() {
		if (busy) return;
		if (!title.trim()) {
			err = 'Bitte einen Titel angeben.';
			return;
		}
		if (!file) {
			err = 'Bitte eine Datei wählen.';
			return;
		}
		busy = true;
		err = '';

		// 1) Datensatz anlegen (noch ohne file_path).
		const { data: created, error: insErr } = await supabase
			.from('document')
			.insert({
				title: title.trim(),
				category,
				doc_date: docDate || null,
				description: description.trim() || null,
				event_id: eventId || null,
				file_name: file.name,
				mime_type: file.type || null,
				size_bytes: file.size,
				uploaded_by: data.memberId
			})
			.select('id')
			.single();
		if (insErr || !created) {
			busy = false;
			err = 'Anlegen fehlgeschlagen: ' + (insErr?.message ?? 'unbekannt');
			return;
		}

		// 2) Datei hochladen, Pfad "<id>/<bereinigter-name>".
		const safeName = file.name.replace(/[^\w.-]+/g, '_');
		const path = `${created.id}/${safeName}`;
		const { error: upErr } = await supabase.storage
			.from('documents')
			.upload(path, file, { contentType: file.type || undefined, upsert: true });
		if (upErr) {
			busy = false;
			err = 'Upload fehlgeschlagen: ' + upErr.message;
			return;
		}
		await supabase.from('document').update({ file_path: path }).eq('id', created.id);

		// 3) Volltext serverseitig extrahieren (best-effort, nicht fatal).
		supabase.functions
			.invoke('extract-document-text', { body: { id: created.id } })
			.catch(() => {});

		// 4) Optional Mitglieder benachrichtigen.
		if (notify) {
			await supabase.rpc('notify_document', { p_document_id: created.id });
		}

		busy = false;
		await goto(resolve('/dokumente'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Dokument hinzufügen" eyebrow="Ablage" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/dokumente'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<Card>
			<Input label="Titel" bind:value={title} required />
			<label class="field">
				<span class="field__label">Kategorie</span>
				<select value={category} onchange={onCategory}>
					{#each categoryOptions as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
				</select>
			</label>
			<Input label="Datum (Bezug, z. B. Sitzungsdatum)" type="date" bind:value={docDate} />
			<Input label="Beschreibung" multiline bind:value={description} />
			<label class="field">
				<span class="field__label">Termin (optional)</span>
				<select bind:value={eventId}>
					<option value="">— keiner —</option>
					{#each data.events as ev (ev.id)}
						<option value={ev.id}>{eventFmt.format(new Date(ev.starts_at))} · {ev.title}</option>
					{/each}
				</select>
			</label>
		</Card>

		<Card>
			<span class="field__label">Datei</span>
			<label class="filepick">
				<input type="file" accept={ACCEPTED_FILE_TYPES} onchange={onFile} disabled={busy} />
				<span>{file ? file.name : 'Datei wählen (PDF, Word, …)'}</span>
			</label>
			<label class="check">
				<input type="checkbox" bind:checked={notify} />
				<span>Mitglieder benachrichtigen</span>
			</label>
		</Card>

		{#if err}<p class="err">{err}</p>{/if}

		<Button fullWidth disabled={busy} onclick={save}>
			{#snippet iconLeft()}<Plus size={18} />{/snippet}
			{busy ? 'Speichern …' : 'Dokument speichern'}
		</Button>
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
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.field__label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-strong);
	}
	.field select {
		font-size: var(--text-base);
		padding: var(--space-2);
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.2));
		border-radius: var(--radius-sm, 8px);
		background: var(--surface, #fff);
		color: var(--text-strong);
		min-height: 44px;
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
	.check {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 44px;
		font-size: var(--text-base);
		color: var(--text-strong);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
