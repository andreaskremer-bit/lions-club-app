<script lang="ts" module>
	import type { Component } from 'svelte';
	export type SegOption = { value: string; label: string; icon?: Component<{ size?: number }> };
</script>

<script lang="ts">
	type Props = {
		options: SegOption[];
		value?: string;
		onchange?: (value: string) => void;
	};

	let { options, value = $bindable(), onchange }: Props = $props();

	function select(v: string) {
		value = v;
		onchange?.(v);
	}
</script>

<div class="lc-seg" role="tablist">
	{#each options as o (o.value)}
		{@const Icon = o.icon}
		<button
			type="button"
			role="tab"
			aria-selected={o.value === value}
			class={['lc-seg__btn', o.value === value ? 'lc-seg__btn--active' : '']
				.filter(Boolean)
				.join(' ')}
			onclick={() => select(o.value)}
		>
			{#if Icon}<Icon size={17} />{/if}{o.label}
		</button>
	{/each}
</div>
