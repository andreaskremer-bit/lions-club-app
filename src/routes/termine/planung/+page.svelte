<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Button, Card, SegmentedControl } from '$lib/components/ui';
	import { ChevronLeft, Plus } from '@lucide/svelte';
	import { seriesDates, type Rhythm, type EventType } from '$lib/dates';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	const typeLabel: Record<EventType, string> = {
		clubabend: 'Club-Abend',
		versammlung: 'Mitglieder-Versammlung',
		reise: 'Club-Reise',
		gesellig: 'Gesellig',
		lions_termin: 'Lions-Termin'
	};
	const typeOptions = (Object.keys(typeLabel) as EventType[]).map((v) => ({
		value: v,
		label: typeLabel[v]
	}));

	let mode = $state<'einzeln' | 'serie'>('einzeln');
	const modeOptions = [
		{ value: 'einzeln', label: 'Einzeltermin' },
		{ value: 'serie', label: 'Serie' }
	];

	let title = $state('');
	let type = $state<EventType>('clubabend');
	let location = $state('');
	let description = $state('');
	let dateStr = $state('');
	let timeStr = $state('19:00');
	let reminderDays = $state('3');
	let reminderDaysNum = $derived(
		reminderDays.trim() === ''
			? 3
			: Math.max(0, Math.min(60, Math.floor(Number(reminderDays)) || 0))
	);
	let rhythm = $state<Rhythm>('monthly');
	let count = $state('6');
	let countNum = $derived(Math.max(1, Math.min(52, Math.floor(Number(count)) || 1)));
	const rhythmOptions: { value: Rhythm; label: string }[] = [
		{ value: 'weekly', label: 'wöchentlich' },
		{ value: 'biweekly', label: '14-täglich' },
		{ value: 'monthly', label: 'monatlich' }
	];

	let busy = $state(false);
	let err = $state('');

	const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

	function combine(d: string, t: string): Date | null {
		if (!d || !t) return null;
		const [y, mo, da] = d.split('-').map(Number);
		const [h, mi] = t.split(':').map(Number);
		return new Date(y, mo - 1, da, h, mi);
	}

	const previewFmt = new Intl.DateTimeFormat('de-DE', {
		weekday: 'short',
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
	let start = $derived(combine(dateStr, timeStr));
	let previewDates = $derived(
		mode === 'serie' && start ? seriesDates(start, rhythm, countNum) : []
	);

	function validate(): Date | null {
		if (!title.trim()) {
			err = 'Bitte einen Titel (Programm/Thema) angeben.';
			return null;
		}
		const s = combine(dateStr, timeStr);
		if (!s) {
			err = 'Bitte Datum und Uhrzeit angeben.';
			return null;
		}
		return s;
	}

	async function saveSingle() {
		const s = validate();
		if (!s || busy) return;
		busy = true;
		err = '';
		const { data: created, error } = await supabase
			.from('event')
			.insert({
				title: title.trim(),
				type,
				location: orNull(location),
				description: orNull(description),
				starts_at: s.toISOString(),
				reminder_days_before: reminderDaysNum
			})
			.select('id')
			.single();
		busy = false;
		if (error) {
			err = 'Anlegen fehlgeschlagen: ' + error.message;
			return;
		}
		await goto(resolve('/termine/[id]', { id: created.id }), { invalidateAll: true });
	}

	async function saveSeries() {
		const s = validate();
		if (!s || busy) return;
		busy = true;
		err = '';
		const rows = seriesDates(s, rhythm, countNum).map((d) => ({
			title: title.trim(),
			type,
			location: orNull(location),
			starts_at: d.toISOString(),
			reminder_days_before: reminderDaysNum
		}));
		const { error } = await supabase.from('event').insert(rows);
		busy = false;
		if (error) {
			err = 'Anlegen fehlgeschlagen: ' + error.message;
			return;
		}
		await goto(resolve('/termine'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Termine planen" eyebrow="Verwaltung" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/termine'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<SegmentedControl options={modeOptions} bind:value={mode} />

		<Card>
			<h2 class="sec">Termin</h2>
			<Input label="Titel (Programm/Thema)" bind:value={title} required />
			<label class="field">
				<span class="field__label">Typ</span>
				<select bind:value={type}>
					{#each typeOptions as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
				</select>
			</label>
			<Input label="Ort" bind:value={location} />
			<div class="row">
				<Input label="Datum" type="date" bind:value={dateStr} class="d" />
				<Input label="Uhrzeit" type="time" bind:value={timeStr} class="t" />
			</div>
			<Input
				label="Erinnerung (Tage vorher)"
				type="number"
				min="0"
				max="60"
				bind:value={reminderDays}
			/>
			{#if mode === 'einzeln'}
				<Input label="Beschreibung" multiline bind:value={description} />
			{/if}
		</Card>

		{#if mode === 'serie'}
			<Card>
				<h2 class="sec">Serie</h2>
				<label class="field">
					<span class="field__label">Rhythmus</span>
					<select bind:value={rhythm}>
						{#each rhythmOptions as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
					</select>
				</label>
				<Input label="Anzahl Termine" type="number" min="1" max="52" bind:value={count} />
				{#if previewDates.length}
					<p class="grp">Vorschau ({previewDates.length})</p>
					<ul class="preview">
						{#each previewDates as d (d.getTime())}
							<li>{previewFmt.format(d)} Uhr</li>
						{/each}
					</ul>
				{/if}
			</Card>
		{/if}

		{#if err}<p class="err">{err}</p>{/if}

		{#if mode === 'einzeln'}
			<Button fullWidth disabled={busy} onclick={saveSingle}>
				{#snippet iconLeft()}<Plus size={18} />{/snippet}
				{busy ? 'Anlegen …' : 'Termin anlegen'}
			</Button>
		{:else}
			<Button fullWidth disabled={busy || previewDates.length === 0} onclick={saveSeries}>
				{#snippet iconLeft()}<Plus size={18} />{/snippet}
				{busy ? 'Anlegen …' : `${previewDates.length} Termine anlegen`}
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
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-3);
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
	.row {
		display: flex;
		gap: var(--space-3);
	}
	.row :global(.d) {
		flex: 1;
	}
	.row :global(.t) {
		flex: 0 0 38%;
	}
	.grp {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
		margin: var(--space-2) 0 var(--space-1);
	}
	.preview {
		margin: 0;
		padding-left: var(--space-4);
	}
	.preview li {
		font-size: var(--text-base);
		color: var(--text-body);
		padding: 2px 0;
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
