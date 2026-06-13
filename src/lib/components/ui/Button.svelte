<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	type Props = {
		variant?: Variant;
		size?: Size;
		fullWidth?: boolean;
		href?: string;
		iconLeft?: Snippet;
		iconRight?: Snippet;
		children?: Snippet;
	} & (HTMLButtonAttributes & HTMLAnchorAttributes);

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		href,
		iconLeft,
		iconRight,
		children,
		class: extra = '',
		...rest
	}: Props = $props();

	let cls = $derived(
		['lc-btn', `lc-btn--${variant}`, `lc-btn--${size}`, fullWidth ? 'lc-btn--full' : '', extra]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href wird vom Aufrufer (ggf. extern/bereits aufgelöst) übergeben -->
	<a {href} class={cls} {...rest}>
		{#if iconLeft}<span class="lc-btn__icon">{@render iconLeft()}</span>{/if}
		{@render children?.()}
		{#if iconRight}<span class="lc-btn__icon">{@render iconRight()}</span>{/if}
	</a>
{:else}
	<button type="button" class={cls} {...rest}>
		{#if iconLeft}<span class="lc-btn__icon">{@render iconLeft()}</span>{/if}
		{@render children?.()}
		{#if iconRight}<span class="lc-btn__icon">{@render iconRight()}</span>{/if}
	</button>
{/if}
