<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, Card, Select } from '$lib/components/ui';
	import type { SelectOption } from '$lib/components/ui';
	import { ChevronLeft, Download } from '@lucide/svelte';
	import { lionsStartYear } from '$lib/dates';

	let { data } = $props();

	const yearLabel = (y: number) => `${y}/${y + 1}`;

	// Select ist string-basiert: Auswahl als String halten, Lions-Jahr als Zahl ableiten.
	let selectedYearValue = $state(String(lionsStartYear(new Date())));
	let selectedYear = $derived(Number(selectedYearValue));

	// Auswahl-Optionen aus dem Datenbestand (frühestes Termin-Jahr bis aktuelles Lions-Jahr).
	let yearOptions = $derived.by((): SelectOption[] => {
		const current = lionsStartYear(new Date());
		let min = current;
		for (const e of data.events) min = Math.min(min, lionsStartYear(new Date(e.starts_at)));
		const out: SelectOption[] = [];
		for (let y = current; y >= min; y--) out.push({ value: String(y), label: yearLabel(y) });
		return out;
	});

	let periodStart = $derived(new Date(selectedYear, 6, 1)); // 1. Juli
	let periodEndExcl = $derived(new Date(selectedYear + 1, 6, 1)); // 1. Juli Folgejahr (exklusiv)

	let eventsInPeriod = $derived(
		data.events.filter((e) => {
			const t = new Date(e.starts_at);
			return t >= periodStart && t < periodEndExcl;
		})
	);
	let eventIds = $derived(new Set(eventsInPeriod.map((e) => e.id)));

	type Row = { id: string; name: string; abwesend: number; anwesend: number; erfasst: number };
	let rows = $derived.by((): Row[] => {
		return data.members.map((m) => {
			let abwesend = 0;
			let anwesend = 0;
			for (const a of data.attendance) {
				if (a.member_id !== m.id || !eventIds.has(a.event_id)) continue;
				if (a.present) anwesend++;
				else abwesend++;
			}
			return {
				id: m.id,
				name: `${m.last_name}, ${m.first_name}`,
				abwesend,
				anwesend,
				erfasst: anwesend + abwesend
			};
		});
	});

	let totalAbsences = $derived(rows.reduce((s, r) => s + r.abwesend, 0));

	function exportCsv() {
		const head = ['Nachname', 'Vorname', 'Abwesenheiten', 'Anwesend', 'Erfasste Termine'];
		const lines = [head.join(',')];
		for (const m of data.members) {
			const r = rows.find((x) => x.id === m.id)!;
			lines.push(
				[m.last_name, m.first_name, r.abwesend, r.anwesend, r.erfasst]
					.map((v) => `"${String(v).replace(/"/g, '""')}"`)
					.join(',')
			);
		}
		// BOM für korrekte Umlaute in Excel
		const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `abwesenheiten_${selectedYear}-${selectedYear + 1}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="shell">
	<AppBar title="Auswertung" eyebrow="Abwesenheiten" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mehr'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<div class="controls">
			<Select
				label="Lions-Jahr"
				options={yearOptions}
				bind:value={selectedYearValue}
				class="year"
			/>
			<Button variant="secondary" disabled={eventsInPeriod.length === 0} onclick={exportCsv}>
				{#snippet iconLeft()}<Download size={18} />{/snippet}
				CSV
			</Button>
		</div>

		<p class="summary">
			{eventsInPeriod.length} spendenpflichtige Termine · {totalAbsences} Abwesenheiten gesamt (aktive
			Mitglieder)
		</p>

		<Card>
			<table class="tbl">
				<thead>
					<tr><th>Mitglied</th><th class="num">Abwesend</th><th class="num">Erfasst</th></tr>
				</thead>
				<tbody>
					{#each rows as r (r.id)}
						<tr>
							<td>{r.name}</td>
							<td class="num">{r.abwesend}</td>
							<td class="num muted">{r.erfasst}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card>
		<p class="hint">
			Abwesenheiten = nicht anwesend bei spendenpflichtigen Terminen im gewählten Lions-Jahr. Der
			Spendenbetrag wird außerhalb der App verrechnet.
		</p>
	</main>
</div>

<style>
	.shell__body {
		gap: var(--space-3);
	}
	.controls {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.controls :global(.year) {
		flex: 0 0 auto;
		min-width: 10rem;
	}
	.summary {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}
	.tbl {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-base);
	}
	.tbl th,
	.tbl td {
		text-align: left;
		padding: var(--space-2) var(--space-1);
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.tbl th {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-weight: 600;
	}
	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.muted {
		color: var(--text-secondary);
	}
	.hint {
		font-size: var(--text-xs);
		color: var(--text-secondary);
		margin: 0;
	}
</style>
