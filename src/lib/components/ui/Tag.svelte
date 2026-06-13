<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		tone?: 'neutral' | 'blue' | 'gold' | 'clay' | 'sage';
		outline?: boolean;
		dot?: boolean;
		icon?: Snippet;
		children?: Snippet;
	} & HTMLAttributes<HTMLSpanElement>;

	let {
		tone = 'neutral',
		outline = false,
		dot = false,
		icon,
		children,
		class: extra = '',
		...rest
	}: Props = $props();

	let cls = $derived(
		['lc-tag', outline ? 'lc-tag--outline' : '', tone !== 'neutral' ? `lc-tag--${tone}` : '', extra]
			.filter(Boolean)
			.join(' ')
	);
</script>

<span class={cls} {...rest}>
	{#if dot}<span class="lc-tag__dot"></span>{/if}
	{#if icon}{@render icon()}{/if}
	{@render children?.()}
</span>
