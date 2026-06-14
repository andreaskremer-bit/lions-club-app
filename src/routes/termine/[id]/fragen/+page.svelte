<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Trash2, Plus } from '@lucide/svelte';
	import type { QuestionType } from './+page';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	const typeLabel: Record<QuestionType, string> = {
		single: 'Einfachauswahl',
		multi: 'Mehrfachauswahl',
		text: 'Freitext',
		boolean: 'Ja/Nein',
		number: 'Zahl'
	};
	const typeOptions = (Object.keys(typeLabel) as QuestionType[]).map((v) => ({
		value: v,
		label: typeLabel[v]
	}));

	let label = $state('');
	let qtype = $state<QuestionType>('single');
	let optionsText = $state('');
	let required = $state(false);
	let busy = $state(false);
	let err = $state('');

	let needsOptions = $derived(qtype === 'single' || qtype === 'multi');
	const optionsPlaceholder = 'Fleisch\nFisch\nVegetarisch';

	async function addQuestion(e: SubmitEvent) {
		e.preventDefault();
		if (!label.trim()) {
			err = 'Bitte einen Fragetext eingeben.';
			return;
		}
		const options = needsOptions
			? optionsText
					.split('\n')
					.map((s) => s.trim())
					.filter(Boolean)
			: null;
		if (needsOptions && (!options || options.length < 2)) {
			err = 'Bitte mindestens zwei Antwortoptionen (je Zeile eine) angeben.';
			return;
		}
		busy = true;
		err = '';
		const nextOrder = (data.questions.at(-1)?.sort_order ?? 0) + 10;
		const { error } = await supabase.from('question').insert({
			event_id: data.event.id,
			label: label.trim(),
			qtype,
			options,
			required,
			sort_order: nextOrder
		});
		busy = false;
		if (error) {
			err = 'Anlegen fehlgeschlagen: ' + error.message;
			return;
		}
		label = '';
		optionsText = '';
		required = false;
		await invalidateAll();
	}

	async function removeQuestion(id: string) {
		if (!confirm('Frage löschen? Vorhandene Antworten gehen verloren.')) return;
		busy = true;
		err = '';
		const { error } = await supabase.from('question').delete().eq('id', id);
		busy = false;
		if (error) {
			err = 'Löschen fehlgeschlagen: ' + error.message;
			return;
		}
		await invalidateAll();
	}
</script>

<div class="shell">
	<AppBar title="Fragen" eyebrow={data.event.title} bordered>
		{#snippet leading()}
			<IconButton
				label="Zurück"
				onclick={() => goto(resolve('/termine/[id]', { id: data.event.id }))}
			>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#if data.questions.length}
			<div class="list">
				{#each data.questions as q (q.id)}
					<div class="q">
						<div class="q__main">
							<span class="q__label">{q.label}{q.required ? ' *' : ''}</span>
							<span class="q__meta">
								{typeLabel[q.qtype]}{q.options?.length ? ` · ${q.options.join(', ')}` : ''}
							</span>
						</div>
						<IconButton label="Löschen" onclick={() => removeQuestion(q.id)} disabled={busy}>
							{#snippet icon()}<Trash2 size={18} />{/snippet}
						</IconButton>
					</div>
				{/each}
			</div>
		{:else}
			<p class="muted">Noch keine Fragen für diesen Termin.</p>
		{/if}

		<Card>
			<h2 class="sec">Neue Frage</h2>
			<form onsubmit={addQuestion} class="form">
				<Input label="Fragetext" bind:value={label} required />
				<label class="field">
					<span class="field__label">Typ</span>
					<select bind:value={qtype}>
						{#each typeOptions as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
					</select>
				</label>
				{#if needsOptions}
					<Input
						label="Antwortoptionen (eine je Zeile)"
						multiline
						bind:value={optionsText}
						placeholder={optionsPlaceholder}
					/>
				{/if}
				<label class="check">
					<input type="checkbox" bind:checked={required} />
					<span>Pflichtfrage</span>
				</label>
				{#if err}<p class="err">{err}</p>{/if}
				<Button type="submit" fullWidth disabled={busy}>
					{#snippet iconLeft()}<Plus size={18} />{/snippet}
					Frage hinzufügen
				</Button>
			</form>
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
	.list {
		display: flex;
		flex-direction: column;
	}
	.q {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.q__main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.q__label {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
	}
	.q__meta {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-3);
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
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
	.check {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-base);
		color: var(--text-strong);
		min-height: 44px;
	}
	.check input {
		width: 20px;
		height: 20px;
	}
	.muted {
		font-size: var(--text-base);
		color: var(--text-secondary);
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
