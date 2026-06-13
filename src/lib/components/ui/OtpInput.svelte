<script lang="ts">
	type Props = {
		length?: number;
		value?: string;
		/** Wird ausgelöst, sobald alle Ziffern gesetzt sind. */
		oncomplete?: (code: string) => void;
	};

	let { length = 6, value = $bindable(''), oncomplete }: Props = $props();

	let refs: HTMLInputElement[] = $state([]);

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
		const digit = raw[raw.length - 1];
		setChar(i, digit);
		if (i < length - 1) refs[i + 1]?.focus();
	}

	function handlePaste(e: ClipboardEvent) {
		const digits = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, length);
		if (digits) {
			e.preventDefault();
			value = digits;
			refs[Math.min(digits.length, length - 1)]?.focus();
			if (digits.length === length) oncomplete?.(digits);
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
			maxlength="1"
			value={chars[i].trim()}
			aria-label={`Ziffer ${i + 1}`}
			oninput={(e) => handleInput(i, e)}
			onkeydown={(e) => handleKey(i, e)}
		/>
	{/each}
</div>
