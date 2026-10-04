<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, Card, Select } from '$lib/components/ui';
	import type { SelectOption } from '$lib/components/ui';
	import { ChevronLeft, Download } from '@lucide/svelte';
	import { lionsStartYear } from '$lib/dates';
	import { csvRow, downloadCsv } from '$lib/csv';

	let { data } = $props();

	const yearLabel = (y: number) => `${y}/${y + 1}`;

	// Vorauswahl: Juli–September das abgeschlossene Vorjahr (dann zieht der Schatzmeister die
	// Abwesenheitsspenden ein), sonst das laufende Lions-Jahr.
	function defaultYear(now = new Date()): number {
		const current = lionsStartYear(now);
		const month = now.getMonth(); // 6 = Juli
		return month >= 6 && month <= 8 ? current - 1 : current;
	}

	// Select ist string-basiert: Auswahl als String halten, Lions-Jahr als Zahl ableiten.
	let selectedYearValue = $state(String(defaultYear()));
	let selectedYear = $derived(Number(selectedYearValue));

	// Auswahl: laufendes und abgeschlossenes Vorjahr. Ältere Anwesenheit wird automatisch
	// gelöscht (Migration 20261004120400), dort stünden nur noch Nullen.
	let yearOptions = $derived.by((): SelectOption[] => {
		const current = lionsStartYear(new Date());
		const out: SelectOption[] = [];
		for (let y = current; y >= current - 1; y--)
			out.push({ value: String(y), label: yearLabel(y) });
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

	// Anwesenheit nur für die Termine des gewählten Lions-Jahres laden (gut 400 Zeilen statt
	// des ganzen Bestands, der an die 1000-Zeilen-Grenze von PostgREST stößt).
	type AttRow = { event_id: string; member_id: string; present: boolean };
	let attendance = $state<AttRow[]>([]);
	let loadingAtt = $state(false);
	let attError = $state('');
	let attRequest = 0;

	$effect(() => {
		const ids = [...eventIds];
		const request = ++attRequest;
		if (ids.length === 0) {
			attendance = [];
			return;
		}
		loadingAtt = true;
		attError = '';
		data.supabase
			.from('attendance')
			.select('event_id, member_id, present')
			.in('event_id', ids)
			.then(({ data: rows, error }) => {
				if (request !== attRequest) return; // Jahr inzwischen gewechselt
				loadingAtt = false;
				if (error) {
					attError = 'Anwesenheit konnte nicht geladen werden.';
					attendance = [];
					return;
				}
				attendance = (rows ?? []) as AttRow[];
			});
	});

	type Row = { id: string; name: string; abwesend: number; anwesend: number; erfasst: number };
	let rows = $derived.by((): Row[] => {
		return data.members.map((m) => {
			let abwesend = 0;
			let anwesend = 0;
			for (const a of attendance) {
				if (a.member_id !== m.id) continue;
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
		const lines = [csvRow(head)];
		for (const m of data.members) {
			const r = rows.find((x) => x.id === m.id)!;
			lines.push(csvRow([m.last_name, m.first_name, r.abwesend, r.anwesend, r.erfasst]));
		}
		downloadCsv(lines, `abwesenheiten_${selectedYear}-${selectedYear + 1}.csv`);
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
			<Button
				variant="secondary"
				disabled={eventsInPeriod.length === 0 || loadingAtt || !!attError}
				onclick={exportCsv}
			>
				{#snippet iconLeft()}<Download size={18} />{/snippet}
				CSV
			</Button>
		</div>

		<p class="summary">
			{eventsInPeriod.length} spendenpflichtige Termine · {totalAbsences} Abwesenheiten gesamt (aktive
			Mitglieder)
		</p>

		{#if attError}<p class="summary">{attError}</p>{/if}

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
			Spendenbetrag wird außerhalb der App verrechnet. Anwesenheitsdaten werden nach zwei
			Lions-Jahren automatisch gelöscht; das laufende und das abgeschlossene Vorjahr sind immer
			vollständig.
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
