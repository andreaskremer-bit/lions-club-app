<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		length?: number;
		value?: string;
		/** Wird ausgelöst, sobald alle Ziffern gesetzt sind. */
		oncomplete?: (code: string) => void;
		/** Beim Erscheinen das erste Feld fokussieren (Code direkt einfügen). */
		autofocus?: boolean;
	};

	let { length = 6, value = $bindable(''), oncomplete, autofocus = false }: Props = $props();

	let refs: HTMLInputElement[] = $state([]);

	onMount(() => {
		if (autofocus) refs[0]?.focus();
	});

	// Mehrere Ziffern auf einmal (Einfügen oder Code-Vorschlag des Systems, der
	// den ganzen Code ins erste Feld schreibt) auf alle Felder verteilen.
	function fillFrom(digits: string) {
		value = digits.slice(0, length);
		refs[Math.min(value.length, length - 1)]?.focus();
		if (value.length === length) oncomplete?.(value);
	}

	let chars = $derived(value.padEnd(length, ' ').slice(0, length).split(''));

	function setChar(i: number, ch: string) {
		const next = value.padEnd(length, ' ').split('');
		next[i] = ch || ' ';
		value = next.join('').replace(/ +$/, '');
		if (value.length === length && !value.includes(' ')) oncomplete?.(value);
	}

	function handleKey(i: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !chars[i].trim() && i > 0) {
			refs[i - 1]?.focus();
		}
	}

	function handleInput(i: number, e: Event) {
		const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '');
		if (!raw) {
			setChar(i, '');
			return;
		}
		if (raw.length >= length) {
			fillFrom(raw);
			return;
		}
		const digit = raw[raw.length - 1];
		setChar(i, digit);
		if (i < length - 1) refs[i + 1]?.focus();
	}

	function handlePaste(e: ClipboardEvent) {
		const digits = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, length);
		if (digits) {
			e.preventDefault();
			fillFrom(digits);
		}
	}
</script>

<div class="lc-otp" onpaste={handlePaste}>
	{#each Array.from({ length }, (_, n) => n) as i (i)}
		<input
			bind:this={refs[i]}
			class={['lc-otp__cell', chars[i].trim() ? 'lc-otp__cell--filled' : '']
				.filter(Boolean)
				.join(' ')}
			inputmode="numeric"
			autocomplete={i === 0 ? 'one-time-code' : 'off'}
			maxlength={i === 0 ? length : 1}
			value={chars[i].trim()}
			aria-label={`Ziffer ${i + 1}`}
			oninput={(e) => handleInput(i, e)}
			onkeydown={(e) => handleKey(i, e)}
		/>
	{/each}
</div>
