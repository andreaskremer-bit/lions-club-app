<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Avatar, Tag, SegmentedControl } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';
	import { nextBirthdayInfo, type BirthdayInfo } from '$lib/dates';

	let { data } = $props();

	const dayFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long' });
	const monthGroupFmt = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });

	let view = $state<'mitglieder' | 'partner'>('mitglieder');
	const viewOptions = [
		{ value: 'mitglieder', label: 'Mitglieder' },
		{ value: 'partner', label: 'Partner/innen' }
	];

	// Einheitliche Zeile für beide Ansichten; `showAge` steuert „wird X"
	// (Partner-Wunsch „Geburtstag ja, Alter nein" via partner_birthday_show_age).
	type Row = {
		memberId: string;
		name: string;
		showAge: boolean;
	} & BirthdayInfo;

	let rows = $derived.by((): Row[] => {
		const list: Row[] =
			view === 'mitglieder'
				? data.members
						.filter((m) => m.birthday)
						.map((m) => ({
							memberId: m.id,
							name: `${m.first_name} ${m.last_name}`,
							showAge: true,
							...nextBirthdayInfo(m.birthday!)
						}))
				: data.members
						.filter((m) => m.partner_birthday)
						.map((m) => ({
							memberId: m.id,
							name:
								[m.partner_first_name, m.partner_last_name].filter(Boolean).join(' ') ||
								'Partner/in',
							showAge: m.partner_birthday_show_age,
							...nextBirthdayInfo(m.partner_birthday!)
						}));
		return list.sort((a, b) => a.days - b.days);
	});

	// Nach Monat des nächsten Geburtstags gruppieren (Reihenfolge bleibt erhalten).
	let grouped = $derived.by(() => {
		const groups: { key: string; label: string; rows: Row[] }[] = [];
		for (const r of rows) {
			const key = `${r.date.getFullYear()}-${r.date.getMonth()}`;
			let g = groups.find((x) => x.key === key);
			if (!g) {
				g = { key, label: monthGroupFmt.format(r.date), rows: [] };
				groups.push(g);
			}
			g.rows.push(r);
		}
		return groups;
	});

	function whenLabel(r: Row): string {
		if (r.today) return 'heute';
		if (r.days === 1) return 'morgen';
		return `in ${r.days} Tagen`;
	}
</script>

<div class="shell">
	<AppBar title="Geburtstage" eyebrow="Mitglieder" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mehr'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<SegmentedControl options={viewOptions} bind:value={view} />

		{#each grouped as g (g.key)}
			<div class="group">
				<p class="month">{g.label}</p>
				<div class="list">
					{#each g.rows as r (r.memberId)}
						<a class="bday" href={resolve('/mitglieder/[id]', { id: r.memberId })}>
							<Avatar name={r.name} size="sm" />
							<span class="bday__main">
								<span class="bday__name">{r.name}</span>
								<span class="bday__date">
									{r.showAge
										? `${dayFmt.format(r.date)} · wird ${r.turning}`
										: dayFmt.format(r.date)}
								</span>
							</span>
							{#if r.today}
								<Tag tone="gold" dot>heute</Tag>
							{:else}
								<span class="bday__in">{whenLabel(r)}</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{:else}
			<p class="empty">Keine Geburtstage hinterlegt.</p>
		{/each}
	</main>
</div>

<style>
	.group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.month {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--text-secondary);
		margin: 0;
	}
	.list {
		display: flex;
		flex-direction: column;
	}
	.bday {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
		text-decoration: none;
		color: inherit;
	}
	.bday__main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.bday__name {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-strong);
	}
	.bday__date {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.bday__in {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		flex: none;
	}
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
</style>
