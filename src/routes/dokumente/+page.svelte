<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, SegmentedControl } from '$lib/components/ui';
	import { ChevronLeft, Plus, FileText, Download, Pencil } from '@lucide/svelte';
	import { categoryLabel, categoryOptions, type DocumentRow } from '$lib/documents';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let canManage = $derived((data.permissions ?? []).includes('publish_content'));

	const COLS =
		'id, title, category, doc_date, description, event_id, file_path, file_name, created_at';

	let docs = $state<DocumentRow[]>(untrack(() => data.documents));
	let searchTerm = $state('');
	let category = $state<string>(''); // '' = alle
	let sort = $state<'datum' | 'titel' | 'kategorie'>('datum');
	let loading = $state(false);

	const sortOptions = [
		{ value: 'datum', label: 'Datum' },
		{ value: 'titel', label: 'Titel' },
		{ value: 'kategorie', label: 'Kategorie' }
	];

	const dateFmt = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});

	async function runQuery() {
		loading = true;
		const term = searchTerm.trim();
		// Mit Suchbegriff: search_documents (Teilwort/ILIKE + deutsche Volltextsuche
		// über Titel + Beschreibung + Dateiinhalt), sonst direkt die Tabelle.
		let q = term
			? supabase.rpc('search_documents', { term }).select(COLS)
			: supabase.from('document').select(COLS);
		if (category) q = q.eq('category', category);
		if (sort === 'titel') q = q.order('title');
		else if (sort === 'kategorie')
			q = q.order('category').order('doc_date', { ascending: false, nullsFirst: false });
		else
			q = q
				.order('doc_date', { ascending: false, nullsFirst: false })
				.order('created_at', { ascending: false });
		const { data: rows, error } = await q;
		if (error) console.error('Dokumentsuche fehlgeschlagen:', error.message);
		docs = (rows ?? []) as DocumentRow[];
		loading = false;
	}

	let debounce: ReturnType<typeof setTimeout>;
	function onSearch() {
		clearTimeout(debounce);
		debounce = setTimeout(runQuery, 300);
	}

	function setCategory(c: string) {
		category = c;
		runQuery();
	}

	$effect(() => {
		void sort; // bei Sortierwechsel neu laden
		runQuery();
	});

	async function download(d: DocumentRow) {
		if (!d.file_path) return;
		const { data: signed } = await supabase.storage
			.from('documents')
			.createSignedUrl(d.file_path, 60);
		if (signed?.signedUrl) window.open(signed.signedUrl, '_blank');
	}
</script>

<div class="shell">
	<AppBar title="Dokumente" eyebrow="Ablage" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mehr'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
		{#snippet trailing()}
			{#if canManage}
				<IconButton label="Dokument hinzufügen" onclick={() => goto(resolve('/dokumente/neu'))}>
					{#snippet icon()}<Plus />{/snippet}
				</IconButton>
			{/if}
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<Input
			placeholder="Suchen (Titel, Beschreibung, Inhalt) …"
			bind:value={searchTerm}
			oninput={onSearch}
		/>

		<div class="chips">
			<button
				class={['chip', category === '' ? 'chip--on' : ''].join(' ')}
				onclick={() => setCategory('')}>Alle</button
			>
			{#each categoryOptions as o (o.value)}
				<button
					class={['chip', category === o.value ? 'chip--on' : ''].join(' ')}
					onclick={() => setCategory(o.value)}>{o.label}</button
				>
			{/each}
		</div>

		<SegmentedControl options={sortOptions} bind:value={sort} />

		<div class="list">
			{#each docs as d (d.id)}
				<div class="doc">
					<span class="doc__icon"><FileText size={20} /></span>
					<button class="doc__main" onclick={() => download(d)} disabled={!d.file_path}>
						<span class="doc__title">{d.title}</span>
						<span class="doc__meta">
							{categoryLabel[d.category]}{#if d.doc_date}
								· {dateFmt.format(new Date(d.doc_date))}{/if}
						</span>
						{#if d.description}<span class="doc__desc">{d.description}</span>{/if}
					</button>
					<span class="doc__actions">
						{#if d.file_path}
							<IconButton label="Herunterladen" onclick={() => download(d)}>
								{#snippet icon()}<Download size={18} />{/snippet}
							</IconButton>
						{/if}
						{#if canManage}
							<IconButton
								label="Bearbeiten"
								onclick={() => goto(resolve('/dokumente/[id]/bearbeiten', { id: d.id }))}
							>
								{#snippet icon()}<Pencil size={18} />{/snippet}
							</IconButton>
						{/if}
					</span>
				</div>
			{:else}
				<p class="empty">{loading ? 'Lädt …' : 'Keine Dokumente gefunden.'}</p>
			{/each}
		</div>
	</main>
</div>

<style>
	.shell__body {
		gap: var(--space-3);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.chip {
		min-height: 36px;
		padding: 0 var(--space-3);
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.18));
		border-radius: 999px;
		background: none;
		color: var(--text-body);
		font: inherit;
		font-size: var(--text-sm);
		cursor: pointer;
	}
	.chip--on {
		background: var(--lions-blue, #1e4fa3);
		border-color: var(--lions-blue, #1e4fa3);
		color: #fff;
		font-weight: 600;
	}
	.list {
		display: flex;
		flex-direction: column;
	}
	.doc {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.doc__icon {
		color: var(--lions-blue, #1e4fa3);
		margin-top: 2px;
		flex: none;
	}
	.doc__main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
		text-align: left;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
		padding: 0;
	}
	.doc__main:disabled {
		cursor: default;
	}
	.doc__title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
	}
	.doc__meta {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.doc__desc {
		font-size: var(--text-sm);
		color: var(--text-body);
	}
	.doc__actions {
		display: flex;
		gap: var(--space-1);
		flex: none;
	}
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
</style>
