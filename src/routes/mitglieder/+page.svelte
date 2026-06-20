<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Input, Switch, Avatar } from '$lib/components/ui';
	import { Search, UserPlus, Phone, Mail } from '@lucide/svelte';
	import type { MemberListItem } from './+page';

	let { data } = $props();

	let query = $state('');
	// Standard: nur aktive Mitglieder. Inaktive + Ehrenmitglieder (selten) zuschaltbar.
	let showInactive = $state(false);

	let aktivCount = $derived(data.members.filter((m) => m.status === 'aktiv').length);

	// Liste: „Nachname, Vorname" (Telefonbuch-Ordnung, deckt sich mit der DB-Sortierung).
	// Akademischer Titel (Dr./Prof.) bewusst NUR auf der Profilseite, nicht in der Liste.
	const listName = (m: MemberListItem) => `${m.last_name}, ${m.first_name}`;
	// Für aria-Labels: schlichter Vor-/Nachname ohne Titel.
	const plainName = (m: MemberListItem) => `${m.first_name} ${m.last_name}`;

	/** Alle Ämter des aktuellen Lions-Jahres, nach sort_order. */
	function amtList(m: MemberListItem) {
		return m.member_amt
			.map((r) => r.amt)
			.filter((a): a is NonNullable<typeof a> => !!a)
			.sort((a, b) => a.sort_order - b.sort_order);
	}
	/** Volle Amtsnamen für `title` (mehrere mit Komma); leer wenn keine. */
	const amtTitle = (m: MemberListItem) =>
		amtList(m)
			.map((a) => a.label)
			.join(', ');
	/** Für die Suche: Name + alle vollen Amtsnamen (oder „Mitglied"). */
	const amtFull = (m: MemberListItem) => amtTitle(m) || 'Mitglied';

	/**
	 * Untertitel: inaktive/Ehrenmitglieder haben keine Ämter → reines Status-Label.
	 * Aktive zeigen ALLE Amts-Kürzel (mehrere mit „ · "; kein Amt ⇒ leer, kein „Mitglied").
	 */
	function roleLine(m: MemberListItem): string {
		if (m.status === 'ehrenmitglied') return 'Ehrenmitglied';
		if (m.status === 'inaktiv') return 'Mitglied (inaktiv)';
		return amtList(m)
			.map((a) => a.abbr ?? a.label)
			.join(' · ');
	}

	const tel = (m: MemberListItem) => m.mobile || m.phone;

	// Dezente Avatar-Tönung (stabil je Mitglied) für etwas Farbe in der Liste.
	function avatarTone(id: string): 'blue' | 'gold' | 'cream' {
		let h = 0;
		for (const c of id) h = (h + c.charCodeAt(0)) % 3;
		return (['blue', 'gold', 'cream'] as const)[h];
	}

	let filtered = $derived(
		data.members.filter((m) => {
			if (!showInactive && m.status !== 'aktiv') return false;
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return `${m.first_name} ${m.last_name} ${amtFull(m)}`.toLowerCase().includes(q);
		})
	);

	type MemberGroup = { letter: string | null; members: MemberListItem[] };
	/**
	 * Gruppierung nach Nachnamen-Anfangsbuchstaben (DB liefert bereits nach
	 * last_name sortiert). Bei aktiver Suche KEINE Buchstaben-Header — dann ist
	 * die Trefferliste die relevante Struktur.
	 */
	let groups = $derived.by<MemberGroup[]>(() => {
		if (query.trim()) return [{ letter: null, members: filtered }];
		const out: MemberGroup[] = [];
		let cur: MemberGroup | null = null;
		for (const m of filtered) {
			const letter = (m.last_name[0] ?? '#').toUpperCase();
			if (!cur || cur.letter !== letter) {
				cur = { letter, members: [] };
				out.push(cur);
			}
			cur.members.push(m);
		}
		return out;
	});
</script>

<div class="shell">
	<AppBar
		title="Mitglieder"
		eyebrow={`${aktivCount} aktiv · ${data.members.length} gesamt`}
		large
		bordered
	>
		{#snippet trailing()}
			{#if data.permissions.includes('manage_members')}
				<IconButton
					label="Neues Mitglied"
					tone="primary"
					onclick={() => goto(resolve('/mitglieder/neu'))}
				>
					{#snippet icon()}<UserPlus />{/snippet}
				</IconButton>
			{/if}
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<Input placeholder="Name oder Amt suchen…" bind:value={query} aria-label="Mitglied suchen">
			{#snippet icon()}<Search size={18} />{/snippet}
		</Input>

		<Switch label="Auch inaktive & Ehrenmitglieder anzeigen" bind:checked={showInactive} />

		{#if data.loadError}
			<p class="state state--error">Mitglieder konnten nicht geladen werden: {data.loadError}</p>
		{:else}
			{#if filtered.length === 0}
				<p class="state">Keine Mitglieder gefunden.</p>
			{:else}
				<div class="list">
					{#each groups as g (g.letter ?? '_')}
						{#if g.letter}
							<div class="ltr" aria-hidden="true">{g.letter}</div>
						{/if}
						{#each g.members as m (m.id)}
							<div class="mrow">
								<button
									class="mrow__main"
									onclick={() => goto(resolve('/mitglieder/[id]', { id: m.id }))}
								>
									<Avatar
										name={`${m.first_name} ${m.last_name}`}
										src={(m.photo_path && data.photoUrls[m.photo_path]) || null}
										size="lg"
										tone={avatarTone(m.id)}
									/>
									<span class="mrow__text">
										<span class="mrow__name">{listName(m)}</span>
										{#if roleLine(m)}
											<span
												class="mrow__role"
												class:mrow__role--muted={m.status === 'inaktiv'}
												title={amtTitle(m) || undefined}>{roleLine(m)}</span
											>
										{/if}
									</span>
								</button>
								{#if tel(m)}
									<a
										class="mrow__act"
										href={`tel:${tel(m)}`}
										aria-label={`${plainName(m)} anrufen`}
									>
										<Phone size={20} />
									</a>
								{/if}
								<a
									class="mrow__act"
									href={`mailto:${m.email}`}
									aria-label={`${plainName(m)} E-Mail`}
								>
									<Mail size={20} />
								</a>
							</div>
						{/each}
					{/each}
				</div>
			{/if}
		{/if}
	</main>
</div>

<style>
	.shell__body {
		gap: var(--space-3);
	}
	.list {
		display: flex;
		flex-direction: column;
	}
	/* Dezenter, nicht-klebender Buchstaben-Trenner zur schnellen Orientierung. */
	.ltr {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		font-weight: var(--fw-bold);
		color: var(--primary);
		padding: var(--space-3) 0 var(--space-1);
	}
	.ltr::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border-hairline);
	}
	.mrow {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		border-bottom: 1px solid var(--border-hairline);
	}
	.mrow__main {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
		padding: var(--space-3) var(--space-1) var(--space-3) 0;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		color: inherit;
		font: inherit;
		border-radius: var(--radius-md);
	}
	.mrow__main:hover {
		background: var(--cream-50);
	}
	.mrow__text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}
	.mrow__name {
		font-size: var(--text-md);
		font-weight: var(--fw-bold);
		color: var(--text-strong);
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.mrow__role {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.mrow__role--muted {
		color: var(--text-muted);
	}
	.mrow__act {
		flex: none;
		width: 44px;
		height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		border-radius: var(--radius-md);
		transition: color var(--dur-fast) var(--ease-standard);
	}
	.mrow__act:hover {
		color: var(--primary);
		background: var(--surface-blue);
	}
	.state {
		font-size: var(--text-base);
		color: var(--text-secondary);
		padding: var(--space-5) 0;
		text-align: center;
	}
	.state--error {
		color: var(--clay, #b4502f);
	}
</style>
