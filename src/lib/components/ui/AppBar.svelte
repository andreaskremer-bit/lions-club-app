<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title?: string;
		eyebrow?: string;
		bordered?: boolean;
		center?: boolean;
		large?: boolean;
		leading?: Snippet;
		trailing?: Snippet;
	};

	let { title, eyebrow, bordered = false, center = false, large = false, leading, trailing }: Props =
		$props();

	let cls = $derived(
		[
			'lc-appbar',
			bordered ? 'lc-appbar--bordered' : '',
			center ? 'lc-appbar--center' : '',
			large ? 'lc-appbar--large' : ''
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<header class={cls}>
	{#if leading}<div class="lc-appbar__lead">{@render leading()}</div>{/if}
	<div class="lc-appbar__title-wrap">
		{#if eyebrow}<span class="lc-appbar__eyebrow">{eyebrow}</span>{/if}
		{#if title}<span class="lc-appbar__title">{title}</span>{/if}
	</div>
	{#if trailing}<div class="lc-appbar__trail">{@render trailing()}</div>{/if}
</header>
