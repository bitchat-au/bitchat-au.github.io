<script lang="ts">
	import { scope, t } from '@i18n';
	import { onEnter } from '../../helpers/on_enter.svelte';
	import { featureList, features } from '../../services/features.svelte';
	import Icon from './Icon.svelte';

	const scopedT = scope('features.popup');

	let codeInput = $state('');
	let codeError = $state(false);
	$effect(() => {
		if (!codeError) return;

		const timeout = setTimeout(() => {
			codeError = false;
		}, 3000);

		return () => clearTimeout(timeout);
	});

	function submitcode() {
		codeError = !features.checkPassword(codeInput.trim());
		codeInput = '';
	}

	const activeFeatureList = $derived(
		featureList
			.filter(feature => features.has(feature.key))
	);
</script>

<article popover="auto" id="feature-popover">
	<header>
		<h2>{scopedT('title')}</h2>
		<button
			class="transparent"
			disabled={activeFeatureList.length === 0}
			onclick={() => features.clearAll()}
		>
			<small>{scopedT('deleteAll')}</small>
		</button>
	</header>

	<ul>
		{#each activeFeatureList as { key, depth } (key)}
			<li style:--indent={depth}>
				<label>
					{t(`features.${key}`)}
					<input
						type="checkbox"
						class="sr-only feature-checkbox"
						checked={features.isActive(key)}
						onchange={() => features.toggle(key)}
					/>

					<span class="true-false-container" aria-hidden="true">
						<span class="true">{scopedT('true')}</span>
						<span>/</span>
						<span class="false">{scopedT('false')}</span>
					</span>
				</label>
			</li>
		{/each}
		{#if activeFeatureList.length === 0}
			<li class="no-features">
				{scopedT('noneAvailable')} <br />
				{scopedT('askTeacher')}
			</li>
		{/if}
	</ul>

	<div class="input-field">
		<div class="input-container">
			<input
				type="text"
				placeholder={scopedT('featureCodePlaceholder')}
				bind:value={codeInput}
				use:onEnter={submitcode}
				aria-label={scopedT('featureCodeInputAriaLabel')}
			/>
			<button onclick={submitcode} aria-label={scopedT('featureCodeSubmitAriaLabel')}
				><Icon name="arrow-right" /></button
			>
		</div>
		{#if codeError}
			<small class="field-error">{scopedT('wrongCode')}</small>
		{/if}
	</div>
</article>

<button class="features transparent" popovertarget="feature-popover">
	<Icon name="angle-down" />
	{scopedT('title')}
</button>

<style>
	button.features {
		anchor-name: --feature-anchor;

		display: flex;
		align-items: flex-end;
		gap: 8px;
		margin-left: auto;
		font: 16px/14px var(--heading);
		color: var(--white);
		background-color: transparent;
		padding: 8px 12px;

		&:hover {
			background-color: rgba(0, 0, 0, 0.2);
		}

		#feature-popover:popover-open + & {
			background-color: rgba(0, 0, 0, 0.2);
		}
	}

	#feature-popover {
		flex-direction: column;
		position: absolute;
		position-anchor: --feature-anchor;
		position-area: bottom span-left;
		background-color: var(--bg);
		border: 1px solid var(--muted-grey);
		color: var(--white);
		padding: 16px;
		width: 400px;
		gap: 16px;

		&:popover-open {
			display: flex;
		}

		header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
		}

		ul {
			list-style: none;
			padding: 0;
			margin: 0;
			display: flex;
			flex-direction: column;

			li {
				margin-left: calc(var(--indent) * 1rem);

				label {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 8px;
					padding: 1px 0;
					cursor: pointer;

					&:has(:focus-visible) {
						outline-style: solid;
						outline-width: 2px;
					}
				}
			}

			.no-features {
				width: 100%;
				text-align: center;
				color: var(--white);
				font-size: 14px;
				padding: 16px 0;
			}
		}
	}

	.true-false-container {
		display: flex;
		gap: 2px;
		font-size: 12px;
		color: var(--muted-grey);
		user-select: none;

		.feature-checkbox:checked + & .true {
			color: var(--electric-green);
		}
		.feature-checkbox:not(:checked) + & .false {
			color: var(--danger);
		}
	}
</style>
