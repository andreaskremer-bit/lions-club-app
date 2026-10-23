<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		AppBar,
		IconButton,
		Button,
		Input,
		Card,
		SegmentedControl,
		HintCard
	} from '$lib/components/ui';
	import { ChevronLeft, X, Save } from '@lucide/svelte';
	import type { AmtCluster, Assignment } from './+page';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	const cy = untrack(() => data.currentYear);
	let yearStr = $state(String(cy));
	let year = $derived(Number(yearStr));

	const ljLabel = (y: number) => `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
	const yearOptions = [
		{ value: String(cy), label: `Aktuelles LJ ${ljLabel(cy)}` },
		{ value: String(cy + 1), label: `Kommendes LJ ${ljLabel(cy + 1)}` }
	];

	const clusterLabel: Record<AmtCluster, string> = {
		clubvorstand: 'Clubvorstand',
		weiterer_vorstand: 'Weiterer Clubvorstand',
		beauftragte: 'Club-Beauftragte',
		foerderverein: 'Vorstand Förderverein'
	};
	const clusterOrder: AmtCluster[] = [
		'clubvorstand',
		'weiterer_vorstand',
		'beauftragte',
		'foerderverein'
	];

	let assignments = $state<Assignment[]>(untrack(() => data.assignments));
	let busy = $state(false);
	let err = $state('');

	const memberName = (id: string) => {
		const m = data.members.find((x) => x.id === id);
		return m ? `${m.first_name} ${m.last_name}` : '–';
	};
	let activeMembers = $derived(data.members.filter((m) => m.status === 'aktiv'));
	let praesidentAmtId = $derived(data.amts.find((a) => a.key === 'praesident')?.id);

	function amtsOfCluster(c: AmtCluster) {
		return data.amts.filter((a) => a.cluster === c);
	}
	function holders(amtId: string) {
		return assignments
			.filter((a) => a.amt_id === amtId && a.lions_year === year)
			.map((a) => a.member_id);
	}
	let pastPraesident = $derived(
		(() => {
			if (!praesidentAmtId) return null;
			const a = assignments.find((x) => x.amt_id === praesidentAmtId && x.lions_year === year - 1);
			return a ? memberName(a.member_id) : null;
		})()
	);

	async function assign(amtId: string, memberId: string) {
		if (busy || !memberId) return;
		busy = true;
		err = '';
		const { error } = await supabase
			.from('member_amt')
			.insert({ member_id: memberId, amt_id: amtId, lions_year: year });
		busy = false;
		if (error) {
			err = 'Zuweisen fehlgeschlagen: ' + error.message;
			return;
		}
		assignments.push({ member_id: memberId, amt_id: amtId, lions_year: year });
	}

	// April–Juni: Hinweis, wenn das kommende Lions-Jahr noch leer ist. Ohne Eintrag
	// übernimmt der stündliche Job offices-rollover am 1.7. die Ämter (kein Lockout), aber
	// der Vorstand soll die Nachfolge bewusst eintragen. Der Förderverein zählt nicht mit
	// (eigene Wahl, wird am 1.7. getrennt übernommen) – wie beim Juni-Hinweis per Push.
	let fvAmtIds = $derived(
		new Set(data.amts.filter((a) => a.cluster === 'foerderverein').map((a) => a.id))
	);
	let nextYearEmpty = $derived(
		!assignments.some((a) => a.lions_year === cy + 1 && !fvAmtIds.has(a.amt_id))
	);
	const month = new Date().getMonth(); // 3 = April
	const showNextYearHint = month >= 3 && month <= 5;

	async function unassign(amtId: string, memberId: string) {
		if (busy) return;
		if (
			memberId === data.memberId &&
			year === cy &&
			!confirm(
				'Du entfernst dich selbst aus diesem Amt im laufenden Lions-Jahr. Rechte, die daran hängen, verlierst du sofort. Fortfahren?'
			)
		)
			return;
		busy = true;
		err = '';
		const { error } = await supabase
			.from('member_amt')
			.delete()
			.eq('member_id', memberId)
			.eq('amt_id', amtId)
			.eq('lions_year', year);
		busy = false;
		if (error) {
			err = 'Entfernen fehlgeschlagen: ' + error.message;
			return;
		}
		assignments = assignments.filter(
			(a) => !(a.member_id === memberId && a.amt_id === amtId && a.lions_year === year)
		);
	}

	function onPick(amtId: string, e: Event) {
		const sel = e.target as HTMLSelectElement;
		const id = sel.value;
		sel.value = '';
		if (id) assign(amtId, id);
	}

	// Vereinslokal
	let venue = $state(
		untrack(() => ({
			name: data.venue.name ?? '',
			street: data.venue.street ?? '',
			zip: data.venue.zip ?? '',
			city: data.venue.city ?? ''
		}))
	);
	let venueBusy = $state(false);
	let venueMsg = $state('');
	async function saveVenue() {
		if (venueBusy) return;
		venueBusy = true;
		venueMsg = '';
		const { error } = await supabase
			.from('club_venue')
			.update({
				name: venue.name?.trim() || null,
				street: venue.street?.trim() || null,
				zip: venue.zip?.trim() || null,
				city: venue.city?.trim() || null,
				updated_at: new Date().toISOString()
			})
			.eq('id', 1);
		venueBusy = false;
		venueMsg = error ? 'Speichern fehlgeschlagen: ' + error.message : 'Vereinslokal gespeichert.';
	}
</script>

<div class="shell">
	<AppBar title="Vorstand & Ämter" eyebrow="Verwaltung" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mehr'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<SegmentedControl options={yearOptions} bind:value={yearStr} />
		{#if pastPraesident}
			<p class="pastp">Past-Präsident: <strong>{pastPraesident}</strong></p>
		{/if}
		{#if showNextYearHint && nextYearEmpty}
			<HintCard tone="warning" title="Kommendes Lions-Jahr noch nicht besetzt">
				Trag die Ämter für {ljLabel(cy + 1)} ein. Ohne Eintrag übernimmt die App am 1. Juli die Ämter
				des laufenden Jahres, damit niemand seine Rechte verliert.
			</HintCard>
		{/if}
		{#if err}<p class="err">{err}</p>{/if}

		{#each clusterOrder as c (c)}
			<Card>
				<h2 class="sec">{clusterLabel[c]}</h2>
				{#each amtsOfCluster(c) as a (a.id)}
					<div class="amt">
						<span class="amt__label"
							>{a.label}{#if !a.display_only}<span class="amt__rights">Rechte</span>{/if}</span
						>
						<div class="amt__holders">
							{#each holders(a.id) as mid (mid)}
								<span class="chip">
									{memberName(mid)}
									<button
										class="chip__x"
										aria-label="Entfernen"
										disabled={busy}
										onclick={() => unassign(a.id, mid)}
									>
										<X size={14} />
									</button>
								</span>
							{/each}
						</div>
						<select class="amt__pick" disabled={busy} onchange={(e) => onPick(a.id, e)}>
							<option value="">+ Mitglied …</option>
							{#each activeMembers.filter((m) => !holders(a.id).includes(m.id)) as m (m.id)}
								<option value={m.id}>{m.last_name}, {m.first_name}</option>
							{/each}
						</select>
					</div>
				{/each}
			</Card>
		{/each}

		<Card>
			<h2 class="sec">Vereinslokal (Default für Clubabend/MV)</h2>
			<Input label="Name" bind:value={venue.name} />
			<Input label="Straße" bind:value={venue.street} />
			<div class="row">
				<Input label="PLZ" bind:value={venue.zip} class="z" />
				<Input label="Ort" bind:value={venue.city} class="o" />
			</div>
			{#if venueMsg}<p class="msg">{venueMsg}</p>{/if}
			<Button disabled={venueBusy} onclick={saveVenue}>
				{#snippet iconLeft()}<Save size={18} />{/snippet}
				{venueBusy ? 'Speichern …' : 'Vereinslokal speichern'}
			</Button>
		</Card>
	</main>
</div>

<style>
	.sec {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 var(--space-3);
	}
	.pastp {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}
	.amt {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
	}
	.amt__label {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.amt__rights {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--lions-blue, #1e4fa3);
		border: 1px solid currentColor;
		border-radius: 999px;
		padding: 0 6px;
	}
	.amt__holders {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: var(--surface-2, rgba(0, 0, 0, 0.05));
		border-radius: 999px;
		padding: 3px 4px 3px 10px;
		font-size: var(--text-sm);
		color: var(--text-strong);
	}
	.chip__x {
		display: inline-flex;
		border: none;
		background: none;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 2px;
	}
	.amt__pick {
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--hairline, rgba(0, 0, 0, 0.2));
		border-radius: var(--radius-sm, 8px);
		background: var(--surface, #fff);
		color: var(--text-strong);
		min-height: 40px;
		align-self: flex-start;
	}
	.row {
		display: flex;
		gap: var(--space-3);
	}
	.row :global(.z) {
		flex: 0 0 35%;
	}
	.row :global(.o) {
		flex: 1;
	}
	.err {
		color: var(--clay, #b4502f);
		font-size: var(--text-base);
		margin: 0;
	}
	.msg {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}
</style>
