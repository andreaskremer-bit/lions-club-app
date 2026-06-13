<script lang="ts" module>
	export type Status = 'yes' | 'no' | 'open' | 'present';

	/** Feste Status-Vokabeln (Spec): RSVP + Anwesenheit. */
	export const STATUS_LABELS: Record<Status, string> = {
		yes: 'Zugesagt',
		no: 'Abgesagt',
		open: 'Offen',
		present: 'Anwesend'
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		status?: Status;
		/** Nur der Punkt, ohne Label — für dichte Listenzeilen. */
		dotOnly?: boolean;
		children?: Snippet;
	} & HTMLAttributes<HTMLSpanElement>;

	let { status = 'open', dotOnly = false, children, class: extra = '', ...rest }: Props = $props();
</script>

{#if dotOnly}
	<span
		class={['lc-status-dot', `lc-status-dot--${status}`, extra].filter(Boolean).join(' ')}
		aria-label={STATUS_LABELS[status]}
		{...rest}
	></span>
{:else}
	<span class={['lc-status', `lc-status--${status}`, extra].filter(Boolean).join(' ')} {...rest}>
		<span class="lc-status__dot"></span>
		{#if children}{@render children()}{:else}{STATUS_LABELS[status]}{/if}
	</span>
{/if}
