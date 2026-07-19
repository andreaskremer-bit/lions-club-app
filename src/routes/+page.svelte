<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar } from '$lib/components/ui';
	import type { Status } from '$lib/components/ui';
	import EventCard from '$lib/components/EventCard.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import { Bell } from '@lucide/svelte';

	let { data } = $props();
	let nextEvent = $derived(data.nextEvent);
	let latestNews = $derived(data.latestNews);

	let ownStatus = $derived.by<Status>(() => {
		if (!nextEvent) return 'open';
		const r = nextEvent.event_response.find((x) => x.member_id === data.myMemberId);
		return r ? (r.status === 'zugesagt' ? 'yes' : 'no') : 'open';
	});

	let counts = $derived.by(() => {
		if (!nextEvent) return { zu: 0, ab: 0, offen: 0 };
		const zuResp = nextEvent.event_response.filter((r) => r.status === 'zugesagt');
		const zuMembers = zuResp.length;
		const guests = zuResp.reduce((n, r) => n + r.companion.length, 0);
		const ab = nextEvent.event_response.filter((r) => r.status === 'abgesagt').length;
		// „zu" = angemeldete Personen gesamt (Mitglieder + Gäste); „offen" bleibt mitgliederbezogen.
		return { zu: zuMembers + guests, ab, offen: Math.max(0, data.activeCount - zuMembers - ab) };
	});
</script>

<div class="shell">
	<AppBar title="Bonn-Rheinaue" eyebrow="Lions Club" large bordered>
		{#snippet leading()}
			<img class="appbar-emblem" src="/icons/lions-emblem.png" alt="" />
		{/snippet}
		{#snippet trailing()}
			<button
				class="bell"
				aria-label="Benachrichtigungen"
				onclick={() => goto(resolve('/benachrichtigungen'))}
			>
				<Bell size={22} />
				{#if data.unread > 0}<span class="bell__badge">{data.unread}</span>{/if}
			</button>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<section class="block">
			<p class="block__label">Nächster Termin</p>
			{#if nextEvent}
				<EventCard
					id={nextEvent.id}
					title={nextEvent.title}
					type={nextEvent.type}
					location={nextEvent.location}
					starts_at={nextEvent.starts_at}
					status={ownStatus}
					{counts}
				/>
			{:else}
				<p class="muted">Aktuell ist kein kommender Termin geplant.</p>
			{/if}
		</section>

		<section class="block">
			<p class="block__label">Neueste News</p>
			{#if latestNews}
				<NewsCard {...latestNews} />
			{:else}
				<p class="muted">Noch keine Nachrichten.</p>
			{/if}
		</section>
	</main>
</div>

<style>
	.appbar-emblem {
		width: 32px;
		height: 32px;
		object-fit: contain;
		display: block;
	}
	.bell {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		background: none;
		color: var(--text-strong);
		cursor: pointer;
	}
	.bell__badge {
		position: absolute;
		top: 4px;
		right: 2px;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		border-radius: 9px;
		background: var(--clay, #b4502f);
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.block {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.block__label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--text-secondary);
		margin: 0;
	}
	.muted {
		font-size: var(--text-base);
		color: var(--text-secondary);
	}
</style>
