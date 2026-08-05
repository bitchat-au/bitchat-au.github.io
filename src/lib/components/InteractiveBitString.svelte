<script lang="ts">
	import { scope } from '@i18n';
	import type { ImageMatrix } from '../../helpers/images';

	const scopedT = scope('widgets.interactiveBitString');

	interface Props {
		image: ImageMatrix;
		onHover: (index: number | null) => void;
	}

	let { image = $bindable(), onHover: _onHover }: Props = $props();

	let hoverIndex = $state<number | null>(null);

	function onHover(index: number | null) {
		hoverIndex = index;
		_onHover(index);
	}
</script>

<div
	class="bit-string-interactive"
	role="group"
	aria-label={scopedT('bitStringInteractiveAriaLabel')}
>
	{#each image as row, rowIndex (rowIndex)}
		<div class="row">
			<span>{rowIndex + 1}:</span>
			{#each row as pixel, colIndex (colIndex)}
				<button
					class="pixel"
					class:active={pixel === 1}
					aria-label={scopedT('pixelButtonAriaLabel', {
						row: rowIndex + 1,
						col: colIndex + 1
					})}
					onmouseover={() => onHover(rowIndex * 5 + colIndex)}
					onfocus={() => onHover(rowIndex * 5 + colIndex)}
					onmouseleave={() => onHover(null)}
					onblur={() => onHover(null)}
					onclick={() => (image[rowIndex][colIndex] = pixel === 1 ? 0 : 1)}>{pixel}</button
				>
			{/each}
		</div>
	{/each}
</div>
<span class="bit-string" aria-label={scopedT('bitStringAriaLabel')}
	>{scopedT('bitStringLabel')}:
	{#each image.flat() as pixel, index (index)}
		<span class:highlight={hoverIndex === index}>{pixel}</span>
	{/each}
</span>

<style>
	.highlight {
		text-decoration: underline;
	}

	.bit-string {
		font-family: var(--mono);
		font-size: 0.9rem;
		color: var(--muted-grey);
	}

	.bit-string-interactive {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;

		.row {
			display: flex;
			align-items: center;

			span {
				margin-right: 0.5rem;
				font-family: var(--sans-display);
			}

			.pixel {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 20px;
				height: 20px;
				font-family: var(--mono);

				&:not(.active) {
					background-color: var(--bg);
					color: var(--white);
					border: 1px solid var(--white);

					&:hover {
						background-color: var(--muted-grey);
					}
				}

				&.active {
					background-color: var(--white);
					color: var(--bg);

					&:hover {
						background-color: #aaa;
					}
				}
			}
		}
	}
</style>
