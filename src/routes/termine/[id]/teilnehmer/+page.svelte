<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button, Card } from '$lib/components/ui';
	import { ChevronLeft, Download } from '@lucide/svelte';

	let { data } = $props();

	type Person = { name: string; kind: 'Mitglied' | 'Begleitung'; lookup: string };

	// Personen = zugesagte Mitglieder + ihre Begleitpersonen.
	let persons = $derived.by((): Person[] => {
		const out: Person[] = [];
		for (const r of data.responses) {
			const mn = r.member ? `${r.member.first_name} ${r.member.last_name}` : 'Unbekannt';
			out.push({ name: mn, kind: 'Mitglied', lookup: `m:${r.member_id}` });
			for (const c of r.companion)
				out.push({ name: c.name, kind: 'Begleitung', lookup: `c:${c.id}` });
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
		const head = ['Name', 'Typ', ...data.questions.map((q) => q.label)];
		const lines = [head.join(',')];
		for (const p of persons) {
			const row = [p.name, p.kind, ...data.questions.map((q) => cell(p, q.id))];
			lines.push(row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
		}
		const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `teilnehmer_${data.event.title.replace(/[^\w-]+/g, '_')}.csv`;
		a.click();
		URL.revokeObjectURL(url);
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
							{#each data.questions as q (q.id)}<th>{q.label}</th>{/each}
						</tr>
					</thead>
					<tbody>
						{#each persons as p (p.lookup)}
							<tr>
								<td>{p.name}</td>
								<td class="muted">{p.kind}</td>
								{#each data.questions as q (q.id)}<td>{cell(p, q.id)}</td>{/each}
							</tr>
						{:else}
							<tr><td colspan={2 + data.questions.length} class="muted">Noch keine Zusagen.</td></tr
							>
						{/each}
					</tbody>
				</table>
			</div>
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
		gap: var(--space-3);
		padding: var(--screen-pad);
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
