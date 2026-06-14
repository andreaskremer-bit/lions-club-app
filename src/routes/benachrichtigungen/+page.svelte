<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Button } from '$lib/components/ui';
	import { ChevronLeft } from '@lucide/svelte';

	let { data } = $props();
	let supabase = $derived(data.supabase);

	let unreadCount = $derived(data.notifications.filter((n) => !n.read_at).length);
	let busy = $state(false);

	const fmt = new Intl.DateTimeFormat('de-DE', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});

	async function markAllRead() {
		if (busy || unreadCount === 0) return;
		busy = true;
		await supabase
			.from('notification')
			.update({ read_at: new Date().toISOString() })
			.is('read_at', null);
		busy = false;
		await invalidateAll();
	}

	function open(n: (typeof data.notifications)[number]) {
		if (n.event_id) goto(resolve('/termine/[id]', { id: n.event_id }));
	}
</script>

<div class="shell">
	<AppBar title="Benachrichtigungen" eyebrow="Aktuell" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		{#if unreadCount > 0}
			<div class="bar">
				<span class="bar__label">{unreadCount} ungelesen</span>
				<Button variant="ghost" disabled={busy} onclick={markAllRead}>Alle als gelesen</Button>
			</div>
		{/if}

		<div class="list">
			{#each data.notifications as n (n.id)}
				<button
					class={['note', n.read_at ? '' : 'note--unread', n.event_id ? 'note--link' : '']
						.filter(Boolean)
						.join(' ')}
					onclick={() => open(n)}
					disabled={!n.event_id}
				>
					{#if !n.read_at}<span class="note__dot"></span>{/if}
					<span class="note__main">
						<span class="note__title">{n.title}</span>
						{#if n.body}<span class="note__body">{n.body}</span>{/if}
						<span class="note__time">{fmt.format(new Date(n.created_at))}</span>
					</span>
				</button>
			{:else}
				<p class="empty">Keine Benachrichtigungen.</p>
			{/each}
		</div>
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
		gap: var(--space-2);
		padding: var(--screen-pad);
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.bar__label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}
	.list {
		display: flex;
		flex-direction: column;
	}
	.note {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		width: 100%;
		text-align: left;
		padding: var(--space-3) 0;
		border: none;
		border-bottom: 1px solid var(--hairline, rgba(0, 0, 0, 0.08));
		background: none;
		color: inherit;
		font: inherit;
	}
	.note--link {
		cursor: pointer;
	}
	.note__dot {
		margin-top: 7px;
		width: 8px;
		height: 8px;
		flex: none;
		border-radius: 50%;
		background: var(--lions-blue, #1e4fa3);
	}
	.note--unread .note__title {
		font-weight: 700;
	}
	.note__main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.note__title {
		font-size: var(--text-base);
		color: var(--text-strong);
	}
	.note__body {
		font-size: var(--text-sm);
		color: var(--text-body);
	}
	.note__time {
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}
	.empty {
		font-size: var(--text-base);
		color: var(--text-secondary);
		text-align: center;
		padding: var(--space-5) 0;
	}
</style>
