<script lang="ts">
	import { scope } from '@i18n';
	import FlashMicrobit from '../Components/FlashMicrobit.svelte';

	const scopedT = scope('flasher');

	let step: 'intro' | 'flashMaster' | 'flashDummy' | 'done' | 'unsupportedBrowser' = $state('intro');
	let radioChannel = $state(1);
	let flashing = $state(false);
	let hasFlashedFirstDummy = $state(false);

	function goToBitChat() {
		location.pathname = '';
	}

	$effect(() => {
		if (!navigator.usb) {
			step = 'unsupportedBrowser';
		}
	})
</script>

<main>
	{#if step === 'intro'}
		<header>
			<h1>{scopedT('title')}</h1>
			<p class="subheading">{scopedT('subtitle')}</p>
		</header>

		<hr />

		<div class="config">
			<div class="input-field">
				<label for="radiochannel">{scopedT('groupNumber')}</label>
				<div class="input-container">
					<input
						type="number"
						name="radiochannel"
						id="radiochannel"
						bind:value={radioChannel}
						placeholder={scopedT('groupNumber')}
					/>
				</div>
			</div>

			<button onclick={() => (step = 'flashDummy')} disabled={flashing}>
				{scopedT('start')}
			</button>
		</div>
	{:else if step === 'flashDummy'}
		<div class="card flash">
			<FlashMicrobit
				{radioChannel}
				source="dummy"
				isSecond={hasFlashedFirstDummy}
				onFlashComplete={() => {
					step = 'flashDummy';
					hasFlashedFirstDummy = true;
				}}
			/>
		</div>
		<div class="card goto-master">
			<p>
				Når du har programmeret alle dine micro:bits kan du gå videre til at programmere din server
			</p>
			<button class="large" onclick={() => (step = 'flashMaster')}>
				Programmer server micro:bit
			</button>
		</div>
		<button class="large transparent" onclick={() => (step = 'intro')}>
			{scopedT('backToStart')}
		</button>
	{:else if step === 'flashMaster'}
		<FlashMicrobit
			{radioChannel}
			source="master"
			onFlashComplete={() => (step = 'done')}
			skipRemoveStep
		/>
		<button class="large transparent" onclick={() => (step = 'intro')}>
			{scopedT('backToStart')}
		</button>
	{:else if step === 'done'}
		<h2 class="m-0">{scopedT('done')}</h2>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p class="text-center">{@html scopedT('doneDescription')}</p>

		<div class="buttons">
			<button class="secondary large" onclick={() => (step = 'intro')}>
				{scopedT('backToStart')}
			</button>
			<button class="large" onclick={goToBitChat}>
				{scopedT('continueToBitchat')}
			</button>
		</div>
	{:else if step === 'unsupportedBrowser'}
		<h2 class="m-0">{scopedT('noWebUSBSupport.title')}</h2>
		<p class="text-center">{scopedT('noWebUSBSupport.description')}</p>
		<a href="/" class="button large">
			{scopedT('noWebUSBSupport.backToBitchat')}
		</a>
	{/if}
</main>

<style>
	main {
		padding: 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	header {
		text-align: center;
	}

	.card {
		background-color: var(--bg);
		border: 1px solid var(--stroke);
		padding: 1.5rem;
		width: 100%;
	}

	.card.flash {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.card.goto-master {
		display: flex;
		align-items: center;
		padding: 1rem;
		gap: 1rem;

		button {
			flex-grow: 1;
			white-space: nowrap;
		}
	}

	.config {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
	}
</style>
