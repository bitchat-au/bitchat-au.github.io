<script lang="ts">
	import { scope } from '@i18n';
	import { COMMON_IMAGES, encryptImage, type ImageMatrix } from '../../helpers/images';
	import { userImages } from '../../services/user_images.svelte';
	import ImageMatrixRenderer from '../Components/ImageMatrixRenderer.svelte';

	const scopedT = scope('codeCracker');

	let imageSelection: 'own' | 'random' = $state('own');
	let correctCode = $state('');
	let inputCode = $state('');
	let selectedImage: ImageMatrix | null = $state(null);
	let decryptedImage: ImageMatrix = $state(COMMON_IMAGES.EMPTY);
	let correctness = $state(0);
	let showHint = $state(false);
	let tries = $state(0);

	function generateImage() {
		const candidates =
			imageSelection == 'own'
				? [...userImages, COMMON_IMAGES.SAD, COMMON_IMAGES.HAPPY]
				: [
						COMMON_IMAGES.SAD,
						COMMON_IMAGES.HAPPY,
						COMMON_IMAGES.HEART,
						COMMON_IMAGES.DUCK,
						COMMON_IMAGES.HOUSE,
						COMMON_IMAGES.GHOST,
						COMMON_IMAGES.GIRAFFE,
						COMMON_IMAGES.UMBRELLA,
						COMMON_IMAGES.SNAKE,
						COMMON_IMAGES.RABBIT,
						COMMON_IMAGES.COW,
						COMMON_IMAGES.PITCHFORK,
						COMMON_IMAGES.SWORD
					];

		const image = candidates[Math.floor(Math.random() * candidates.length)];
		correctCode = Array.from({ length: 5 }, () => (Math.random() > 0.5 ? 'A' : 'B')).join('');
		inputCode = 'AAAAA';
		selectedImage = encryptImage(image, correctCode);
		correctness = 0;
		decryptedImage = selectedImage;
		showHint = false;
		tries = 0;
	}

	function checkCode() {
		tries++;
		correctness = [...inputCode]
			.map((char, index) => char === correctCode[index])
			.filter(Boolean).length;
		decryptedImage = selectedImage ? encryptImage(selectedImage, inputCode) : COMMON_IMAGES.EMPTY;
	}

	const flipCharacter = (index: number) => {
		if (index < 0 || index >= inputCode.length) return;
		const newChar = inputCode[index] === 'A' ? 'B' : 'A';
		inputCode = inputCode.substring(0, index) + newChar + inputCode.substring(index + 1);
	};

	function reset() {
		selectedImage = null;
		inputCode = 'AAAAA';
		correctness = 0;
		decryptedImage = COMMON_IMAGES.EMPTY;
		showHint = false;
	}
</script>

<div class="code-cracker">
	{#if !selectedImage}
		<header>
			<h2>{scopedT('title')}</h2>
			<!-- Injected html will always come from translations, and will never be untrusted user input -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<span class="subheading">{@html scopedT('instructions')}</span>
		</header>

		<div class="source-selection">
			<div class="radio-group">
				<label class="as-button"
					><input type="radio" name="billede" value="own" bind:group={imageSelection} />{scopedT(
						'ownImage'
					)}</label
				>
				<label class="as-button"
					><input type="radio" name="billede" value="random" bind:group={imageSelection} />{scopedT(
						'randomImage'
					)}</label
				>
			</div>
			<hr />
			<button onclick={generateImage}>{scopedT('generate')}</button>
		</div>
	{:else}
		{#if correctness === 5}
			<h2>{scopedT('decrypted')}</h2>
			<p class="subheading">
				{scopedT('decryptedDescription')} <br />
				{scopedT(showHint ? 'triesWithHint' : 'triesWithoutHint', { tries })}
			</p>

			<button onclick={reset}>{scopedT('tryAgain')}</button>
		{:else}
			<div class="code-input">
				<div class="input">
					<h3 class="label">{scopedT('code')}:</h3>
					<div class="characters">
						{#each inputCode.split('') as char, index (index + char)}
							<button class="no-style character" onclick={() => flipCharacter(index)}>
								{char}
							</button>
						{/each}
					</div>
				</div>
				<button onclick={checkCode} class="decrypt">{scopedT('decrypt')}</button>
			</div>
		{/if}

		<ImageMatrixRenderer
			matrix={decryptedImage}
			class="image-preview"
			padding={10}
			caption={scopedT('imageRenderAriaLabel')}
		/>

		{#if correctness < 5}
			<p class="muted attempts">
				{tries > 0 ? scopedT('tries', { tries }) : scopedT('startHelper')}
			</p>

			<div class="hint">
				<hr />

				{#if showHint}
					<div class="indicator-bar">
						<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
						{#each Array.from({ length: 5 }) as _, index (index)}
							<span class:correct={index < correctness} class:incorrect={index >= correctness}
							></span>
						{/each}
					</div>

					<p class="correctness">
						{scopedT('correctness', { correctness })}
					</p>
				{:else}
					<button onclick={() => (showHint = !showHint)}>
						{scopedT('showHint')}
					</button>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.code-cracker {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		flex-grow: 1;
	}

	header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.source-selection {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
		flex-wrap: wrap;
		width: 100%;
	}

	.code-cracker :global(.image-matrix.image-preview) {
		max-width: 300px;
		margin-top: 2rem;
	}

	.attempts {
		margin-top: 0.5rem;
	}

	.code-input {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;

		.input {
			display: flex;
			align-items: center;
			gap: 0.25rem;

			.label {
				margin: 0;
				font-size: 24px;
			}

			.characters {
				display: flex;
				gap: 0.25rem;

				button.character {
					display: flex;
					justify-content: center;
					align-items: center;
					font-family: var(--heading);
					width: 2rem;
					height: 2rem;
					font-size: 1.5rem;
					padding-top: 4px;
					border-bottom: 2px solid var(--white);

					&:hover {
						border-bottom: 2px solid var(--accent);
						background-color: rgb(from var(--accent) r g b / 0.1);
					}
				}
			}
		}

		.decrypt {
			width: 100%;
		}
	}

	.hint {
		display: flex;
		flex-direction: column;
		width: 100%;
		align-items: center;

		.indicator-bar {
			display: flex;
			justify-content: center;
			gap: 0.25rem;
			max-width: 300px;
			width: 100%;

			span {
				flex-grow: 1;
				height: 0.25rem;

				&.correct {
					background-color: var(--accent);
				}

				&.incorrect {
					background-color: var(--danger);
				}
			}
		}

		.correctness {
			font-size: 0.9rem;
			color: var(--muted-grey);
		}
	}
</style>
