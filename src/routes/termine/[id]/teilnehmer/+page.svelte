<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Download } from '@lucide/svelte';
	import { csvRow, downloadCsv } from '$lib/csv';

	let { data } = $props();

	// Kommentar zur Rückmeldung („komme später“) – vorher gespeichert, aber nirgends gezeigt.
	type Person = { name: string; kind: string; lookup: string; comment: string };

	// Personen = zugesagte Mitglieder + alle Begleitpersonen. Begleitung zählt auch, wenn das
	// Mitglied selbst abgesagt hat; dann steht dabei, zu wem sie gehört.
	let persons = $derived.by((): Person[] => {
		const out: Person[] = [];
		for (const r of data.responses) {
			const mn = r.member ? `${r.member.first_name} ${r.member.last_name}` : 'Unbekannt';
			const zugesagt = r.status === 'zugesagt';
			const comment = r.comment ?? '';
			if (zugesagt) out.push({ name: mn, kind: 'Mitglied', lookup: `m:${r.member_id}`, comment });
			for (const c of r.companion)
				out.push({
					name: c.name,
					kind: zugesagt ? 'Begleitung' : `Begleitung von ${mn} (selbst abgesagt)`,
					lookup: `c:${c.id}`,
					// Hat das Mitglied abgesagt, steht sein Kommentar bei der Begleitung.
					comment: zugesagt ? '' : comment
				});
		}
		return out.sort((a, b) => a.name.localeCompare(b.name, 'de'));
	});

	// Antworten-Index: Schlüssel "questionId|m:<memberId>" bzw. "questionId|c:<companionId>".
	let answerIndex = $derived.by(() => {
		const idx: Record<string, unknown> = {};
		for (const a of data.answers) {
			const who = a.companion_id ? `c:${a.companion_id}` : `m:${a.member_id}`;
			idx[`${a.question_id}|${who}`] = a.value;
		}
		return idx;
	});

	function fmt(v: unknown): string {
		if (v === null || v === undefined || v === '') return '—';
		if (Array.isArray(v)) return v.join(', ');
		if (typeof v === 'boolean') return v ? 'Ja' : 'Nein';
		return String(v);
	}

	const cell = (p: Person, qid: string) => fmt(answerIndex[`${qid}|${p.lookup}`]);

	function exportCsv() {
		const head = ['Name', 'Typ', 'Kommentar', ...data.questions.map((q) => q.label)];
		const lines = [csvRow(head)];
		for (const p of persons) {
			lines.push(csvRow([p.name, p.kind, p.comment, ...data.questions.map((q) => cell(p, q.id))]));
		}
		downloadCsv(lines, `teilnehmer_${data.event.title.replace(/[^\w-]+/g, '_')}.csv`);
	}
</script>

<div class="shell">
	<AppBar title="Teilnehmer" eyebrow={data.event.title} bordered>
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
		<div class="bar">
			<span class="count">{persons.length} Teilnehmer (inkl. Begleitung)</span>
			<Button variant="secondary" disabled={persons.length === 0} onclick={exportCsv}>
				{#snippet iconLeft()}<Download size={18} />{/snippet}
				CSV
			</Button>
		</div>

		<Card>
			<div class="scroll">
				<table class="tbl">
					<thead>
						<tr>
							<th>Name</th>
							<th>Typ</th>
							<th>Kommentar</th>
							{#each data.questions as q (q.id)}<th>{q.label}</th>{/each}
						</tr>
					</thead>
					<tbody>
						{#each persons as p (p.lookup)}
							<tr>
								<td>{p.name}</td>
								<td class="muted">{p.kind}</td>
								<td class="comment">{p.comment || '—'}</td>
								{#each data.questions as q (q.id)}<td>{cell(p, q.id)}</td>{/each}
							</tr>
						{:else}
							<tr><td colspan={3 + data.questions.length} class="muted">Noch keine Zusagen.</td></tr
							>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	</main>
</div>

<style>
	.shell__body {
		gap: var(--space-3);
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.count {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.comment {
		white-space: normal;
		min-width: 10rem;
	}
	.scroll {
		overflow-x: auto;
	}
	.tbl {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-base);
		white-space: nowrap;
	}
	.tbl th,
	.tbl td {
		text-align: left;
		padding: var(--space-2);
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.tbl th {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-weight: 600;
	}
	.muted {
		color: var(--text-secondary);
	}
</style>
