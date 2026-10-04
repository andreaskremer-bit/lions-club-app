<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { AppBar, IconButton, Card, Tag } from '$lib/components/ui';
	import {
		CHANGELOG,
		changelogVersion,
		formatChangelogDate,
		type ChangeKind
	} from '$lib/changelog';
	import { APP_COMMIT, APP_VERSION } from '$lib/version';
	import { ChevronLeft } from '@lucide/svelte';

	// Farbe ist nur Beiwerk – die Art der Änderung steht immer als Wort da.
	const TONE: Record<ChangeKind, 'blue' | 'sage' | 'clay'> = {
		neu: 'blue',
		verbessert: 'sage',
		behoben: 'clay'
	};
</script>

<div class="shell">
	<AppBar title="Version" eyebrow="Über die App" bordered>
		{#snippet leading()}
			<IconButton label="Zurück" onclick={() => goto(resolve('/mehr'))}>
				{#snippet icon()}<ChevronLeft />{/snippet}
			</IconButton>
		{/snippet}
	</AppBar>

	<main class="shell__body">
		<Card>
			<p class="ver__label">Installierte Version</p>
			<p class="ver__number">{APP_VERSION}</p>
			<p class="ver__commit">Stand {APP_COMMIT}</p>
			<p class="ver__hint">
				Die App aktualisiert sich selbst. Steht hier eine ältere Nummer als bei anderen, hilft es,
				die App einmal ganz zu schließen und neu zu öffnen.
			</p>
		</Card>

		<h2 class="ver__heading">Was ist neu</h2>

		{#each CHANGELOG as entry (entry.date)}
			<Card>
				<div class="rel__head">
					<span class="rel__date">{formatChangelogDate(entry.date)}</span>
					<span class="rel__version">{changelogVersion(entry.date)}</span>
				</div>
				<ul class="rel__list">
					{#each entry.changes as change (change.text)}
						<li class="rel__item">
							<Tag tone={TONE[change.kind]}>{change.kind}</Tag>
							<p class="rel__text">{change.text}</p>
						</li>
					{/each}
				</ul>
			</Card>
		{/each}
	</main>
</div>

<style>
	.ver__label {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		margin: 0;
	}
	.ver__number {
		font-family: var(--font-mono);
		font-size: var(--text-xl);
		color: var(--text-body);
		margin: var(--space-1) 0 0;
	}
	.ver__commit {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		margin: 2px 0 0;
	}
	.ver__hint {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.5;
		margin: var(--space-3) 0 0;
	}
	.ver__heading {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		color: var(--text-body);
		margin: var(--space-2) 0 calc(-1 * var(--space-2));
	}
	.rel__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	.rel__date {
		font-size: var(--text-base);
		font-weight: var(--fw-medium);
		color: var(--text-body);
	}
	.rel__version {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}
	.rel__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	.rel__item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-1);
	}
	.rel__text {
		font-size: var(--text-base);
		color: var(--text-body);
		line-height: 1.5;
		margin: 0;
	}
</style>
