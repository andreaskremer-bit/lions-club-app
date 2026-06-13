<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { ChevronRight } from '@lucide/svelte';

	type Props = {
		title?: string;
		subtitle?: string;
		date?: string;
		chevron?: boolean;
		interactive?: boolean;
		href?: string;
		lead?: Snippet;
		trailing?: Snippet;
	} & HTMLButtonAttributes &
		HTMLAnchorAttributes;

	let {
		title,
		subtitle,
		date,
		chevron = false,
		interactive = true,
		href,
		lead,
		trailing,
		class: extra = '',
		...rest
	}: Props = $props();

	let cls = $derived(
		['lc-row', interactive || href ? '' : 'lc-row--static', extra].filter(Boolean).join(' ')
	);
</script>

{#snippet inner()}
	{#if lead}<span class="lc-row__lead">{@render lead()}</span>{/if}
	<span class="lc-row__body">
		{#if title}<span class="lc-row__title">{title}</span>{/if}
		{#if subtitle}<span class="lc-row__sub">{subtitle}</span>{/if}
	</span>
	{#if date || trailing || chevron}
		<span class="lc-row__trail">
			{#if date}<span class="lc-row__date">{date}</span>{/if}
			{#if trailing}{@render trailing()}{/if}
			{#if chevron}<span class="lc-row__chev"><ChevronRight size={20} /></span>{/if}
		</span>
	{/if}
{/snippet}

{#if href}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href wird vom Aufrufer (ggf. extern/bereits aufgelöst) übergeben -->
	<a {href} class={cls} {...rest}>{@render inner()}</a>
{:else if interactive}
	<button type="button" class={cls} {...rest}>{@render inner()}</button>
{:else}
	<div class={cls}>{@render inner()}</div>
{/if}
