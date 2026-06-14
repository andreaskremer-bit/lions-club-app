<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		AppBar,
		IconButton,
		Input,
		SegmentedControl,
		ListRow,
		Avatar,
		Tag
	} from '$lib/components/ui';
	import { ChevronLeft, Search } from '@lucide/svelte';
	import type { MemberListItem, MemberStatus } from './+page';

	let { data } = $props();

	let query = $state('');
	let statusFilter = $state<'alle' | MemberStatus>('alle');

	const statusOptions = [
		{ value: 'alle', label: 'Alle' },
		{ value: 'aktiv', label: 'Aktiv' },
		{ value: 'ehrenmitglied', label: 'Ehrenmitglied' },
		{ value: 'inaktiv', label: 'Inaktiv' }
	];

	const statusLabel: Record<MemberStatus, string> = {
		aktiv: 'aktiv',
		inaktiv: 'inaktiv',
		ehrenmitglied: 'Ehrenmitglied'
	};
	const statusTone: Record<MemberStatus, 'sage' | 'gold' | 'neutral'> = {
		aktiv: 'sage',
		ehrenmitglied: 'gold',
		inaktiv: 'neutral'
	};

	function fullName(m: MemberListItem): string {
		return [m.title, m.first_name, m.last_name].filter(Boolean).join(' ');
	}

	/** Wichtigstes Amt (kleinste sort_order) als Untertitel; sonst „Mitglied". */
	function primaryAmt(m: MemberListItem): string {
		const ämter = m.member_amt
			.map((r) => r.amt)
			.filter((a): a is NonNullable<typeof a> => !!a)
			.sort((a, b) => a.sort_order - b.sort_order);
		return ämter[0]?.label ?? 'Mitglied';
	}

	let filtered = $derived(
		data.members.filter((m) => {
			if (statusFilter !== 'alle' && m.status !== statusFilter) return false;
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return `${m.first_name} ${m.last_name}`.toLowerCase().includes(q);
		})
	);
</script>

<div class="shell">
	<AppBar title="Mitglieder" eyebrow="Verzeichnis" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<Input placeholder="Mitglied suchen" bind:value={query} aria-label="Mitglied suchen">
			{#snippet icon()}<Search size={18} />{/snippet}
		</Input>

		<SegmentedControl options={statusOptions} bind:value={statusFilter} />

		{#if data.loadError}
			<p class="state state--error">Mitglieder konnten nicht geladen werden: {data.loadError}</p>
		{:else}
			<p class="count">{filtered.length} {filtered.length === 1 ? 'Mitglied' : 'Mitglieder'}</p>

			<div class="list">
				{#each filtered as m (m.id)}
					<ListRow
						href={resolve('/mitglieder/[id]', { id: m.id })}
						title={fullName(m)}
						subtitle={primaryAmt(m)}
						chevron
					>
						{#snippet lead()}<Avatar name={`${m.first_name} ${m.last_name}`} />{/snippet}
						{#snippet trailing()}
							<Tag tone={statusTone[m.status]} dot>{statusLabel[m.status]}</Tag>
						{/snippet}
					</ListRow>
				{:else}
					<p class="state">Keine Mitglieder gefunden.</p>
				{/each}
			</div>
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
		gap: var(--space-3);
		padding: var(--screen-pad);
	}
	.count {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: var(--space-1) 0 0;
	}
	.list {
		display: flex;
		flex-direction: column;
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
