<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		size?: 'md' | 'lg';
		flush?: boolean;
		sunken?: boolean;
		interactive?: boolean;
		children?: Snippet;
	} & HTMLAttributes<HTMLElement>;

	let {
		size = 'md',
		flush = false,
		sunken = false,
		interactive = false,
		children,
		class: extra = '',
		...rest
	}: Props = $props();

	let cls = $derived(
		[
			'lc-card',
			size === 'lg' ? 'lc-card--lg' : '',
			flush ? 'lc-card--flush' : '',
			sunken ? 'lc-card--sunken' : '',
			interactive ? 'lc-card--interactive' : '',
			extra
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if interactive}
	<button type="button" class={cls} {...rest}>{@render children?.()}</button>
{:else}
	<div class={cls} {...rest}>{@render children?.()}</div>
{/if}
