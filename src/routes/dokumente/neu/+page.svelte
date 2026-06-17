<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Select, Checkbox, Button, Card } from '$lib/components/ui';
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
	// Default aus der Kategorie (Protokolle: an), per Checkbox überschreibbar.
	let notify = $derived(notifyByDefault.includes(category));
	let file = $state<File | null>(null);
	let busy = $state(false);
	let err = $state('');

	const eventFmt = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});

	let eventOptions = $derived([
		{ value: '', label: '— keiner —' },
		...data.events.map((ev) => ({
			value: ev.id,
			label: `${eventFmt.format(new Date(ev.starts_at))} · ${ev.title}`
		}))
	]);

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
			<Select label="Kategorie" options={categoryOptions} bind:value={category} />
			<Input label="Datum (Bezug, z. B. Sitzungsdatum)" type="date" bind:value={docDate} />
			<Input label="Beschreibung" multiline bind:value={description} />
			<Select label="Termin (optional)" options={eventOptions} bind:value={eventId} />
		</Card>

		<Card>
			<div class="filepick">
				<span class="filepick__label">Datei</span>
				<label class="filepick__control">
					<input
						class="filepick__input"
						type="file"
						accept={ACCEPTED_FILE_TYPES}
						onchange={onFile}
						disabled={busy}
					/>
					<span class="filepick__btn">Datei wählen</span>
					<span class="filepick__name" class:filepick__name--empty={!file}>
						{file ? file.name : 'PDF, Word, … bis 20 MB'}
					</span>
				</label>
			</div>
			<Checkbox label="Mitglieder benachrichtigen" bind:checked={notify} />
		</Card>

		{#if err}<p class="err">{err}</p>{/if}

		<Button fullWidth disabled={busy} onclick={save}>
			{#snippet iconLeft()}<Plus size={18} />{/snippet}
			{busy ? 'Speichern …' : 'Dokument speichern'}
		</Button>
	</main>
</div>

<style>
	.filepick {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.filepick__label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-strong);
	}
	.filepick__control {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: 48px;
		padding: var(--space-2) var(--space-3);
		background: var(--surface-card);
		border: 1px solid var(--border-field);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			border-color var(--dur-fast) var(--ease-standard),
			box-shadow var(--dur-fast) var(--ease-standard);
	}
	.filepick__control:hover {
		border-color: var(--border-strong);
	}
	.filepick__control:focus-within {
		border-color: var(--border-focus);
		box-shadow: var(--focus-ring);
	}
	.filepick__control:has(.filepick__input:disabled) {
		opacity: 0.6;
		cursor: default;
	}
	/* Natives File-Input visuell entfernen, aber fokussierbar lassen. */
	.filepick__input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}
	.filepick__btn {
		flex: none;
		display: inline-flex;
		align-items: center;
		height: 36px;
		padding: 0 var(--space-4);
		border-radius: var(--radius-sm);
		background: var(--surface-fill);
		border: 1px solid var(--border-field);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-strong);
	}
	.filepick__name {
		min-width: 0;
		flex: 1;
		font-size: var(--text-base);
		color: var(--text-body);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.filepick__name--empty {
		color: var(--text-muted);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
