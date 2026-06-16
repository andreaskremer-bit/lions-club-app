<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		AppBar,
		IconButton,
		Input,
		Select,
		Button,
		Card,
		SegmentedControl,
		HintCard
	} from '$lib/components/ui';
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
	let speaker = $state('');
	let location = $state('');
	let locationTouched = $state(false);
	let description = $state('');
	let dateStr = $state('');
	let timeStr = $state('19:00');
	let endDateStr = $state('');
	let endTimeStr = $state('');
	let endTouched = $state(false);
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

	// Clubabend/MV dauern standardmäßig 2 Std.
	const isTimedType = (t: EventType) => t === 'clubabend' || t === 'versammlung';
	const plus2h = (d: Date) => new Date(d.getTime() + 2 * 60 * 60 * 1000);

	// Ort vorbelegen (überschreibbar): bei Clubabend/MV das Vereinslokal.
	$effect(() => {
		if (!locationTouched && isTimedType(type) && !location && data.venueLocation) {
			location = data.venueLocation;
		}
	});

	// Ende vorschlagen (überschreibbar): bei Clubabend/MV Beginn + 2 Std.
	$effect(() => {
		const s = combine(dateStr, timeStr);
		if (!endTouched && s && isTimedType(type)) {
			const e = plus2h(s);
			const pad = (n: number) => String(n).padStart(2, '0');
			endDateStr = `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())}`;
			endTimeStr = `${pad(e.getHours())}:${pad(e.getMinutes())}`;
		}
	});

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
		const endCombined = combine(endDateStr, endTimeStr);
		const end = endCombined ?? (isTimedType(type) ? plus2h(s) : null);
		if (end && end <= s) {
			err = 'Das Ende muss nach dem Beginn liegen.';
			return;
		}
		busy = true;
		err = '';
		const { data: created, error } = await supabase
			.from('event')
			.insert({
				title: title.trim(),
				type,
				speaker: orNull(speaker),
				location: orNull(location),
				description: orNull(description),
				starts_at: s.toISOString(),
				ends_at: end ? end.toISOString() : null,
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
			ends_at: isTimedType(type) ? plus2h(d).toISOString() : null,
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
			<Select label="Typ" options={typeOptions} bind:value={type} />
			<Input label="Ort" bind:value={location} oninput={() => (locationTouched = true)} />
			<div class="row">
				<Input label="Datum" type="date" bind:value={dateStr} class="d" />
				<Input label="Uhrzeit (Beginn)" type="time" bind:value={timeStr} class="t" />
			</div>
			{#if mode === 'einzeln'}
				<div class="row">
					<Input
						label="Datum (Ende, optional)"
						type="date"
						bind:value={endDateStr}
						class="d"
						oninput={() => (endTouched = true)}
					/>
					<Input
						label="Uhrzeit"
						type="time"
						bind:value={endTimeStr}
						class="t"
						oninput={() => (endTouched = true)}
					/>
				</div>
			{:else}
				<HintCard tone="info">Clubabend/MV: Ende automatisch 2 Std. nach Beginn.</HintCard>
			{/if}
			<Input
				label="Erinnerung (Tage vorher)"
				type="number"
				min="0"
				max="60"
				bind:value={reminderDays}
			/>
			{#if mode === 'einzeln'}
				<Input label="Referent/in (optional)" bind:value={speaker} />
				<Input label="Beschreibung" multiline bind:value={description} />
			{/if}
		</Card>

		{#if mode === 'serie'}
			<Card>
				<h2 class="sec">Serie</h2>
				<Select label="Rhythmus" options={rhythmOptions} bind:value={rhythm} />
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
