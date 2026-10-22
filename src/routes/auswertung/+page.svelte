<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, Card, Select, HintCard } from '$lib/components/ui';
	import type { SelectOption } from '$lib/components/ui';
	import { ChevronLeft, Download } from '@lucide/svelte';
	import { lionsStartYear } from '$lib/dates';
	import { csvRow, downloadCsv } from '$lib/csv';
	import { buildRows, unrecordedEvents, statusLabel, type AttRow } from '$lib/auswertung';

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

	let rows = $derived(buildRows(data.members, attendance));
	let pastEvents = $derived(eventsInPeriod.filter((e) => new Date(e.starts_at) < new Date()));
	let missing = $derived(loadingAtt ? [] : unrecordedEvents(eventsInPeriod, attendance));
	const eventDate = (iso: string) =>
		new Date(iso).toLocaleDateString('de-DE', {
			timeZone: 'Europe/Berlin',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});

	let totalAbsences = $derived(rows.reduce((s, r) => s + r.abwesend, 0));

	function exportCsv() {
		const head = [
			'Nachname',
			'Vorname',
			'Status (heute)',
			'Abwesenheiten',
			'Anwesend',
			'Erfasste Termine'
		];
		const lines = [csvRow(head)];
		for (const r of rows) {
			const m = data.members.find((x) => x.id === r.id)!;
			lines.push(
				csvRow([
					m.last_name,
					m.first_name,
					statusLabel[r.status],
					r.abwesend,
					r.anwesend,
					r.erfasst
				])
			);
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
			{pastEvents.length === 1
				? '1 spendenpflichtiger Termin'
				: `${pastEvents.length} spendenpflichtige Termine`} bisher, davon {pastEvents.length -
				missing.length} erfasst · {totalAbsences}
			{totalAbsences === 1 ? 'Abwesenheit' : 'Abwesenheiten'} gesamt
		</p>

		{#if attError}<p class="summary">{attError}</p>{/if}

		{#if missing.length}
			<HintCard tone="warning" title="Anwesenheit noch nicht erfasst">
				{missing.map((e) => `${eventDate(e.starts_at)} ${e.title}`).join('; ')}. Diese Termine
				zählen für niemanden als Abwesenheit, bis die Anwesenheit erfasst ist.
			</HintCard>
		{/if}

		<Card>
			<table class="tbl">
				<thead>
					<tr><th>Mitglied</th><th class="num">Abwesend</th><th class="num">Erfasst</th></tr>
				</thead>
				<tbody>
					{#each rows as r (r.id)}
						<tr>
							<td>
								{r.name}
								{#if r.status !== 'aktiv'}<span class="st">heute {statusLabel[r.status]}</span>{/if}
							</td>
							<td class="num">{r.abwesend}</td>
							<td class="num muted">{r.erfasst}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card>
		<p class="hint">
			Abwesenheiten = nicht anwesend bei spendenpflichtigen Terminen im gewählten Lions-Jahr. Wer
			heute inaktiv oder Ehrenmitglied ist, aber erfasste Termine hat, steht mit seinem heutigen
			Status in der Liste – ob eine Befreiung für den Zeitraum gilt, entscheidest du. Der
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
	.st {
		display: block;
		color: var(--text-secondary);
		font-size: var(--text-sm);
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
