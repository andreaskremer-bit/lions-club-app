<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		/** Fette erste Zeile. */
		title?: string;
		/** Streifen-/Tönungsfarbe. */
		tone?: 'info' | 'accent' | 'warning' | 'neutral';
		/** Optionales führendes Icon (Lucide). */
		icon?: Snippet;
		children?: Snippet;
		/** Optionale Aktion (z. B. ein Button) unterhalb des Texts. */
		action?: Snippet;
	};

	let { title, tone = 'info', icon, children, action }: Props = $props();
</script>

<div class={`lc-hint lc-hint--${tone}`} role="note">
	{#if icon}<span class="lc-hint__icon">{@render icon()}</span>{/if}
	<div class="lc-hint__body">
		{#if title}<p class="lc-hint__title">{title}</p>{/if}
		{#if children}<p class="lc-hint__text">{@render children()}</p>{/if}
		{#if action}<div class="lc-hint__action">{@render action()}</div>{/if}
	</div>
</div>
