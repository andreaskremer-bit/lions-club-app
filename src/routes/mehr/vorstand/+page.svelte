<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Card } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';

	let { data } = $props();

	const ljLabel = (y: number) => `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
	// Für Mitglieder genügt „Vorstand“: Clubvorstand und weiterer Clubvorstand in einer
	// Gruppe (in dieser Reihenfolge), die Unterscheidung bleibt der Verwaltung (/vorstand).
	const groupsDef = [
		{ key: 'vorstand', label: 'Vorstand', clusters: ['clubvorstand', 'weiterer_vorstand'] },
		{ key: 'beauftragte', label: 'Club-Beauftragte', clusters: ['beauftragte'] }
	] as const;

	const holdersOf = (amtId: string, year: number) =>
		data.holders
			.filter((h) => h.amt_id === amtId && h.lions_year === year && h.member)
			.map((h) => h.member!);

	// Past-Präsident: Präsident des Vorjahres (abgeleitet, wie auf /vorstand).
	let pastPraesident = $derived.by(() => {
		const amt = data.amts.find((a) => a.key === 'praesident');
		return amt ? (holdersOf(amt.id, data.year - 1)[0] ?? null) : null;
	});

	// Nur besetzte Ämter zeigen – leere Beauftragten-Posten wären bloßes Rauschen.
	let groups = $derived(
		groupsDef
			.map((g) => ({
				key: g.key,
				label: g.label,
				rows: g.clusters
					.flatMap((c) => data.amts.filter((a) => a.cluster === c))
					.map((a) => ({ amt: a, members: holdersOf(a.id, data.year) }))
					.filter((r) => r.members.length > 0)
			}))
			.filter((g) => g.rows.length > 0)
	);
</script>

<div class="shell">
	<AppBar title="Vorstand & Ämter" eyebrow={`Lions-Jahr ${ljLabel(data.year)}`} bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mehr'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#each groups as g (g.key)}
			<Card>
				<h2 class="sec">{g.label}</h2>
				<dl class="list">
					{#each g.rows as r (r.amt.id)}
						<div class="row">
							<dt>{r.amt.label}</dt>
							<dd>
								{#each r.members as m, i (m.id)}{#if i > 0},
									{/if}<a href={resolve('/mitglieder/[id]', { id: m.id })}
										>{m.first_name} {m.last_name}</a
									>{/each}
							</dd>
						</div>
						{#if r.amt.key === 'praesident' && pastPraesident}
							<div class="row">
								<dt>Past-Präsident(in)</dt>
								<dd>
									<a href={resolve('/mitglieder/[id]', { id: pastPraesident.id })}
										>{pastPraesident.first_name} {pastPraesident.last_name}</a
									>
								</dd>
							</div>
						{/if}
					{/each}
				</dl>
			</Card>
		{:else}
			<p class="muted">Für dieses Lions-Jahr sind noch keine Ämter eingetragen.</p>
		{/each}
	</main>
</div>

<style>
	.shell__body {
		gap: var(--space-3);
	}
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-3);
	}
	.list {
		margin: 0;
	}
	.row {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.row:last-child {
		border-bottom: 0;
	}
	dt {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	dd {
		margin: 0;
		font-size: var(--text-base);
	}
	dd a {
		color: var(--accent, #1e4fa3);
		text-decoration: none;
		display: inline-block;
		min-height: 44px;
		line-height: 44px;
	}
	.muted {
		color: var(--text-secondary);
	}
</style>
