<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Tag, StatusBadge } from '$lib/components/ui';
	import type { Status } from '$lib/components/ui';
	import { MapPin, Check, X, HelpCircle } from '@lucide/svelte';
	import type { EventType } from '../../routes/termine/+page';

	type Props = {
		id: string;
		title: string;
		type: EventType;
		location: string | null;
		starts_at: string;
		/** Eigener RSVP-Status als Badge (optional). */
		status?: Status;
		/** Rückmeldezahlen als Fußzeile (optional). */
		counts?: { zu: number; ab: number; offen: number };
		/** Wenn gesetzt, ist die Zähler-Fußzeile klickbar (z. B. Meldungen-Sheet). */
		oncounts?: () => void;
	};

	let { id, title, type, location, starts_at, status, counts, oncounts }: Props = $props();

	const typeLabel: Record<EventType, string> = {
		clubabend: 'Club-Abend',
		versammlung: 'Mitglieder-Versammlung',
		reise: 'Club-Reise',
		gesellig: 'Gesellig',
		lions_termin: 'Lions-Termin'
	};
	const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
	const wdFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
	const moFmt = new Intl.DateTimeFormat('de-DE', { month: 'short' });

	let d = $derived(new Date(starts_at));
	let chip = $derived({
		wd: wdFmt.format(d).replace('.', '').toUpperCase(),
		day: d.getDate(),
		mo: moFmt.format(d).replace('.', '').slice(0, 3).toUpperCase(),
		time: timeFmt.format(d)
	});
</script>

<div class="ev">
	<button class="ev__main" onclick={() => goto(resolve('/termine/[id]', { id }))}>
		<span class="ev__chip">
			<span class="ev__chip-wd">{chip.wd}</span>
			<span class="ev__chip-day">{chip.day}</span>
			<span class="ev__chip-mo">{chip.mo}</span>
		</span>
		<span class="ev__content">
			<span class="ev__title">{title}</span>
			<span class="ev__meta">
				{#if location}<MapPin size={15} /> {location} ·
				{/if}{chip.time}
			</span>
			<span class="ev__badges">
				<Tag tone="blue">{typeLabel[type]}</Tag>
				{#if status}<StatusBadge {status} />{/if}
			</span>
		</span>
	</button>

	{#if counts}
		{#snippet inner()}
			<span class="ev__c ev__c--yes"><Check size={16} /> {counts!.zu}</span>
			<span class="ev__c ev__c--no"><X size={16} /> {counts!.ab}</span>
			<span class="ev__c ev__c--open"><HelpCircle size={16} /> {counts!.offen}</span>
		{/snippet}
		{#if oncounts}
			<button class="ev__counts" onclick={oncounts} aria-label="Meldungen ansehen">
				{@render inner()}
			</button>
		{:else}
			<div class="ev__counts">{@render inner()}</div>
		{/if}
	{/if}
</div>

<style>
	.ev {
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-lg);
		background: var(--surface-card);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.ev__main {
		display: flex;
		gap: var(--space-3);
		width: 100%;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		color: inherit;
		font: inherit;
		padding: 0;
	}
	.ev__chip {
		flex: none;
		width: 56px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1px;
		padding: var(--space-2) 0;
		background: var(--surface-blue);
		border-radius: var(--radius-md);
		color: var(--blue-700);
	}
	.ev__chip-wd,
	.ev__chip-mo {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.04em;
	}
	.ev__chip-day {
		font-size: var(--text-xl);
		font-weight: var(--fw-bold);
		line-height: 1;
	}
	.ev__content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}
	.ev__title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--fw-semibold);
		color: var(--text-strong);
		line-height: var(--leading-tight);
	}
	.ev__meta {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.ev__meta :global(svg) {
		flex: none;
	}
	.ev__badges {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: 2px;
	}
	.ev__counts {
		display: flex;
		gap: var(--space-4);
		background: none;
		border: none;
		border-top: 1px solid var(--border-hairline);
		padding: var(--space-3) 0 0;
		cursor: pointer;
		font: inherit;
	}
	div.ev__counts {
		cursor: default;
	}
	.ev__c {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: var(--text-base);
		font-weight: var(--fw-semibold);
		font-variant-numeric: tabular-nums;
	}
	.ev__c--yes {
		color: var(--status-yes-fg);
	}
	.ev__c--no {
		color: var(--status-no-fg);
	}
	.ev__c--open {
		color: var(--text-secondary);
	}
</style>
