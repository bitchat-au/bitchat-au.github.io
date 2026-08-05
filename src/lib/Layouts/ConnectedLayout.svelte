<script lang="ts">
	import { t } from '@i18n';
	import { Features, features } from '../../services/features.svelte';
	import Devices from '../Components/Devices.svelte';
	import FeaturesDropdown from '../Components/FeaturesDropdown.svelte';
	import Icon from '../Components/Icon.svelte';
	import CodeCracker from '../Pages/CodeCracker.svelte';
	import ImageBuilder from '../Pages/ImageBuilder.svelte';
	import MessageLog from '../Pages/MessageLog.svelte';

	let view: 'log' | 'image-builder' | 'code-cracker' | 'empty' = $state(chooseDefaultView());

	function chooseDefaultView(): typeof view {
		if (features.isActive(Features.Server)) return 'log';
		if (features.isActive(Features.ImageBuilder)) return 'image-builder';
		if (features.isActive(Features.KodeKnækkeren)) return 'code-cracker';
		return 'empty';
	}

	// Ensure current view is valid when features change or on init
	$effect(() => {
		if (
			(view === 'log' && !features.isActive(Features.Server)) ||
			(view === 'image-builder' && !features.isActive(Features.ImageBuilder)) ||
			(view === 'code-cracker' && !features.isActive(Features.KodeKnækkeren)) ||
			view === 'empty'
		) {
			view = chooseDefaultView();
		}
	});
</script>

<main>
	<section class="content">
		<header>
			<nav class="feature-navigation">
				<ul>
					{#if features.isActive(Features.Server)}
						<li class:active={view === 'log'}>
							<button class="no-style" onclick={() => (view = 'log')}
								><Icon name="code-block" /> {t('nav.log')}</button
							>
						</li>
					{/if}
					{#if features.isActive(Features.ImageBuilder)}
						<li class:active={view === 'image-builder'}>
							<button class="no-style" onclick={() => (view = 'image-builder')}
								><Icon name="face-grin" /> {t('nav.image-builder')}</button
							>
						</li>
					{/if}
					{#if features.isActive(Features.KodeKnækkeren)}
						<li class:active={view === 'code-cracker'}>
							<button class="no-style" onclick={() => (view = 'code-cracker')}
								><Icon name="lock-open" /> {t('nav.code-cracker')}</button
							>
						</li>
					{/if}
				</ul>
			</nav>
			<FeaturesDropdown />
		</header>

		{#if view === 'log'}
			<MessageLog />
		{/if}
		{#if view === 'image-builder'}
			<ImageBuilder />
		{/if}
		{#if view === 'code-cracker'}
			<CodeCracker />
		{/if}
		{#if view === 'empty'}
			<div class="empty">
				<p>{t('nav.empty')}</p>
			</div>
		{/if}
	</section>

	<section class="devices">
		<h2>{t('devices.title')}</h2>
		<Devices />
	</section>
</main>

<style>
	main {
		display: grid;
		grid-template-columns: auto 300px;
		padding: 24px;
		box-sizing: border-box;
	}

	section {
		width: 100%;
		height: 100%;
	}

	.content {
		padding-right: 24px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		align-items: center;
	}

	.empty {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.devices {
		border-left: 1px solid var(--stroke);
		padding-left: 24px;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
		width: 100%;
	}

	.feature-navigation ul {
		display: flex;
		list-style: none;
		padding: 0;
		margin: 0;
		font: 20px/24px var(--heading);

		li button {
			padding: 6px 12px;
			cursor: pointer;
			border: none;
			background: none;
			border-bottom: 2px solid transparent;
			font: inherit;
			color: inherit;
			display: flex;
			align-items: flex-start;
			gap: 8px;

			&:hover {
				background-color: rgba(0, 0, 0, 0.2);
				border-bottom-color: rgba(0, 0, 0, 0.2);
			}
		}

		li.active button {
			border-bottom-color: var(--white);
			color: var(--accent);

			:global(.icon) {
				color: var(--white);
			}
		}
	}
</style>
