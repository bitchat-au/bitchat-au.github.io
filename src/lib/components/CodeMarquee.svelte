<script lang="ts">
	const seed = '110010110001';

	let marquee: HTMLSpanElement;
	let value = $state(seed);

	function updateValue() {
		if (!marquee) return;

		const styles = getComputedStyle(marquee);
		const fontSize = Number.parseFloat(styles.fontSize) || 10;
		const charWidth = Math.max(1, fontSize * 0.6);
		const visibleChars = Math.ceil(marquee.clientWidth / charWidth);
		const repeatCount = Math.max(4, Math.ceil((visibleChars + seed.length) / seed.length));

		value = seed.repeat(repeatCount);
	}

	$effect(() => {
		updateValue();

		const observer = new ResizeObserver(updateValue);
		observer.observe(marquee);

		return () => observer.disconnect();
	});
</script>

<span bind:this={marquee} class="code-marquee-effect" data-value={value}></span>

<style>
	.code-marquee-effect {
		width: 100%;
		height: 0.6rem;
		line-height: 0.6rem;
		font-family: monospace;
		color: var(--muted-grey);
		opacity: 0.6;
		font-size: 0.6rem;

		overflow: hidden;
		white-space: nowrap;
		position: relative;

		&::before {
			content: attr(data-value) attr(data-value);
			position: absolute;
			top: 0;
			left: 0;
			width: max-content;
			will-change: transform;
			animation: marquee 25s linear infinite;

			@media (prefers-reduced-motion: reduce) {
				animation: none;
			}
		}
	}

	@keyframes marquee {
		0% {
			transform: translateX(-50%);
		}
		100% {
			transform: translateX(0);
		}
	}
</style>
