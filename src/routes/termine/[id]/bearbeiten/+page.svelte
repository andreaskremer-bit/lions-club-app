<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Select, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Trash2 } from '@lucide/svelte';
	import type { EventType } from '$lib/dates';

	let { data } = $props();
	let supabase = $derived(data.supabase);
	let canManage = $derived((data.permissions ?? []).includes('manage_events'));

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

	function splitLocal(iso: string | null): { date: string; time: string } {
		if (!iso) return { date: '', time: '' };
		const d = new Date(iso);
		const pad = (n: number) => String(n).padStart(2, '0');
		return {
			date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
			time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
		};
	}
	function combine(d: string, t: string): Date | null {
		if (!d || !t) return null;
		const [y, mo, da] = d.split('-').map(Number);
		const [h, mi] = t.split(':').map(Number);
		return new Date(y, mo - 1, da, h, mi);
	}

	// Geladenen Termin einmalig snapshotten (kein reaktives Zurücksetzen beim Tippen).
	const ev = untrack(() => data.event);
	const s0 = splitLocal(ev.starts_at);
	const e0 = splitLocal(ev.ends_at);

	let title = $state(ev.title);
	let type = $state<EventType>(ev.type);
	let speaker = $state(ev.speaker ?? '');
	let location = $state(ev.location ?? '');
	let description = $state(ev.description ?? '');
	let startDate = $state(s0.date);
	let startTime = $state(s0.time);
	let endDate = $state(e0.date);
	let endTime = $state(e0.time);
	let reminderDays = $state(String(ev.reminder_days_before));
	let reminderDaysNum = $derived(
		reminderDays.trim() === ''
			? 3
			: Math.max(0, Math.min(60, Math.floor(Number(reminderDays)) || 0))
	);

	let busy = $state(false);
	let err = $state('');

	const orNull = (v: string) => (v.trim() === '' ? null : v.trim());

	async function save() {
		if (busy || !canManage) return;
		if (!title.trim()) {
			err = 'Bitte einen Titel (Programm/Thema) angeben.';
			return;
		}
		const start = combine(startDate, startTime);
		if (!start) {
			err = 'Bitte Datum und Uhrzeit (Beginn) angeben.';
			return;
		}
		const end = endDate && endTime ? combine(endDate, endTime) : null;
		if (end && end <= start) {
			err = 'Das Ende muss nach dem Beginn liegen.';
			return;
		}
		busy = true;
		err = '';
		const { error } = await supabase
			.from('event')
			.update({
				title: title.trim(),
				type,
				speaker: orNull(speaker),
				location: orNull(location),
				description: orNull(description),
				starts_at: start.toISOString(),
				ends_at: end ? end.toISOString() : null,
				reminder_days_before: reminderDaysNum
			})
			.eq('id', ev.id);
		busy = false;
		if (error) {
			err = 'Speichern fehlgeschlagen: ' + error.message;
			return;
		}
		await goto(resolve('/termine/[id]', { id: ev.id }), { invalidateAll: true });
	}

	async function remove() {
		if (busy || !canManage) return;
		if (
			!confirm(
				'Termin wirklich löschen? Rückmeldungen, Anwesenheit, Fragen und Erinnerungen dazu werden mit entfernt.'
			)
		)
			return;
		busy = true;
		err = '';
		const { error } = await supabase.from('event').delete().eq('id', ev.id);
		busy = false;
		if (error) {
			err = 'Löschen fehlgeschlagen: ' + error.message;
			return;
		}
		await goto(resolve('/termine'), { invalidateAll: true });
	}
</script>

<div class="shell">
	<AppBar title="Termin bearbeiten" eyebrow="Verwaltung" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/termine/[id]', { id: ev.id }))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#if !canManage}
			<p class="err">Keine Berechtigung zum Bearbeiten von Terminen.</p>
		{:else}
			<Card>
				<Input label="Titel (Programm/Thema)" bind:value={title} required />
				<Select label="Typ" options={typeOptions} bind:value={type} />
				<Input label="Referent/in (optional)" bind:value={speaker} />
				<Input label="Ort" bind:value={location} />
				<div class="row">
					<Input label="Datum (Beginn)" type="date" bind:value={startDate} class="d" />
					<Input label="Uhrzeit" type="time" bind:value={startTime} class="t" />
				</div>
				<div class="row">
					<Input label="Datum (Ende, optional)" type="date" bind:value={endDate} class="d" />
					<Input label="Uhrzeit" type="time" bind:value={endTime} class="t" />
				</div>
				<Input
					label="Erinnerung (Tage vorher)"
					type="number"
					min="0"
					max="60"
					bind:value={reminderDays}
				/>
				<Input label="Beschreibung" multiline bind:value={description} />
			</Card>

			{#if err}<p class="err">{err}</p>{/if}

			<Button fullWidth disabled={busy} onclick={save}>{busy ? 'Speichern …' : 'Speichern'}</Button>
			<Button variant="ghost" disabled={busy} onclick={remove}>
				{#snippet iconLeft()}<Trash2 size={18} />{/snippet}
				Termin löschen
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
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
</style>
