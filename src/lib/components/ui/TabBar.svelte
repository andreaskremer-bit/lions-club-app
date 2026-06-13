<script lang="ts" module>
	import type { Component } from 'svelte';
	export type TabItem = {
		id: string;
		label: string;
		icon: Component<{ size?: number }>;
		href?: string;
		badge?: number | string;
	};
</script>

<script lang="ts">
	type Props = {
		items: TabItem[];
		value?: string;
		onchange?: (id: string) => void;
	};

	let { items, value, onchange }: Props = $props();
</script>

<nav class="lc-tabbar">
	{#each items as it (it.id)}
		{@const active = it.id === value}
		{@const Icon = it.icon}
		{@const cls = ['lc-tabbar__item', active ? 'lc-tabbar__item--active' : '']
			.filter(Boolean)
			.join(' ')}
		{#if it.href}
			<a {...{ href: it.href, class: cls }} aria-current={active ? 'page' : undefined}>
				<span class="lc-tabbar__icon"><Icon size={24} /></span>
				{#if it.badge}<span class="lc-tabbar__badge">{it.badge}</span>{/if}
				<span class="lc-tabbar__label">{it.label}</span>
			</a>
		{:else}
			<button
				type="button"
				class={cls}
				aria-current={active ? 'page' : undefined}
				onclick={() => onchange?.(it.id)}
			>
				<span class="lc-tabbar__icon"><Icon size={24} /></span>
				{#if it.badge}<span class="lc-tabbar__badge">{it.badge}</span>{/if}
				<span class="lc-tabbar__label">{it.label}</span>
			</button>
		{/if}
	{/each}
</nav>
