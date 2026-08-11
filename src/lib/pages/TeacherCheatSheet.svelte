<script lang="ts">
	import { scope } from '@i18n';
	import {
		encodeFeatures,
		featureList,
		features,
		Features,
		getAllChildren,
		getAllParents
	} from '../../services/features.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { copyToClipboard } from '../../helpers/clipboard';

	const scopedT = scope('teacher');
	const featuresT = scope('features');

	let selectedFeatures = new SvelteSet<Features>();
	const hasSelectedFeatures = $derived(selectedFeatures.size > 0);
	const featureCode = $derived(encodeFeatures(Array.from(selectedFeatures)));
	const shareableLink = $derived(features.getFeatureShareURL(Array.from(selectedFeatures)));

	const copyCode = () => copyToClipboard(featureCode).then(() => alert(scopedT('copiedCode')));
	const copyLink = () => copyToClipboard(shareableLink).then(() => alert(scopedT('copiedLink')));

	const toggleFeature = (feature: Features) => {
		if (selectedFeatures.has(feature)) {
			selectedFeatures.delete(feature);
			getAllChildren(feature).forEach((child) => selectedFeatures.delete(child));
		} else {
			selectedFeatures.add(feature);
			getAllParents(feature).forEach((parent) => selectedFeatures.add(parent));
		}
	};
</script>

<main>
	<h1>{scopedT('title')}</h1>
	<p class="subheading">{scopedT('subtitle')}</p>

	<hr />

	<h2>{scopedT('selectedFeatures')}</h2>
	<p class="subheading">{scopedT('selectedFeaturesDescription')}</p>

	<div class="code">
		<p class="shareable-link" class:waiting={!hasSelectedFeatures}>
			{hasSelectedFeatures ? shareableLink : scopedT('getStarted')}
		</p>
		<div class="vr"></div>
		<button onclick={copyCode} disabled={!hasSelectedFeatures} class="large"
			>{scopedT('copyCode')}</button
		>
		<button onclick={copyLink} disabled={!hasSelectedFeatures} class="large"
			>{scopedT('copyLink')}</button
		>
	</div>

	<hr />

	<h2>{scopedT('allFeatures')}</h2>

	<ul>
		{#each featureList as { key, depth, passwords } (key)}
			<li style="margin-left: {depth * 16}px">
				<label for={key}>
					<input
						type="checkbox"
						id={key}
						checked={selectedFeatures.has(key)}
						onchange={() => toggleFeature(key)}
					/>

					<div>
						<p class="title">{featuresT(key)}</p>
						<p class="muted">{featuresT(['descriptions', key])}</p>
						<div class="passwords">
							<span>Kodeord: </span>
							<ul>
								{#each passwords as password (password)}
									<li><code>{password}</code></li>
								{/each}
							</ul>
						</div>
					</div>
				</label>
			</li>
		{/each}
	</ul>
</main>

<style>
	main {
		padding: 24px;
		height: auto;
	}

	ul {
		list-style: none;
		padding: 0;

		li {
			margin-bottom: 1rem;

			label {
				display: flex;
				align-items: flex-start;
				gap: 1rem;
				cursor: pointer;

				.title {
					font-family: var(--heading);
					font-size: 1.5rem;
					margin: 0;
				}
			}
		}
	}

	input {
		accent-color: var(--accent);
	}

	.code {
		display: flex;
		gap: 1rem;

		.vr {
			width: 1px;
			background-color: var(--stroke);
		}
	}

	.shareable-link {
		font-family: var(--mono);
		background-color: hsl(from var(--bg) h s calc(l * 0.7));
		border: 1px solid var(--stroke);
		overflow-x: auto;
		white-space: nowrap;
		scrollbar-width: thin;
		text-align: start;
		padding: 0.5rem;
		flex-grow: 1;

		&.waiting {
			color: var(--muted-grey);
		}
	}

	.passwords {
		display: flex;
		color: var(--muted-grey);
		gap: 0.5rem;

		ul {
			list-style: none;
			padding: 0;
			margin: 0;
			display: flex;
			gap: 0.5rem;

			code {
				font-family: var(--mono);
				background-color: hsl(from var(--bg) h s calc(l * 0.7));
				border: 1px solid var(--stroke);
				padding: 0.125rem 0.25rem;
			}
		}
	}
</style>
