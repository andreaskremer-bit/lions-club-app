<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		AppBar,
		IconButton,
		Input,
		Select,
		Checkbox,
		Button,
		Card,
		FilePicker
	} from '$lib/components/ui';
	import { ChevronLeft, Plus } from '@lucide/svelte';
	import {
		categoryOptions,
		notifyByDefault,
		uploadDocument,
		MAX_FILE_BYTES,
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

	function onFile(f: File | null) {
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

		const res = await uploadDocument(supabase, {
			file,
			title: title.trim(),
			category,
			docDate,
			description: description.trim() || null,
			eventId: eventId || null,
			memberId: data.memberId
		});
		if ('error' in res) {
			busy = false;
			err = res.error;
			return;
		}

		// Optional Mitglieder benachrichtigen.
		if (notify) {
			await supabase.rpc('notify_document', { p_document_id: res.id });
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
				<FilePicker {file} disabled={busy} onpick={onFile} />
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
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
