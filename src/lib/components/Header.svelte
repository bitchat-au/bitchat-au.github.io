<script>
	import { availableLocales, changeLocale, locale, t } from '@i18n';
	import Icon from './Icon.svelte';
</script>

<header>
	<a href="/" aria-label={t('header.logoAriaLabel')} class="home-link">
		<svg
			viewBox="0 0 157 25"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="logo"
			aria-label={t('header.logoAriaLabel')}
		>
			<path
				d="M10.336 10.336H6.88V8.608H3.424V6.912H0V3.456H3.424V5.184H6.88V6.88H10.336V8.608H13.76V10.336H17.216V13.792H13.76V15.52H10.336V17.248H6.88V18.944H3.424V20.672H0V17.216H3.424V15.52H6.88V13.792H10.336V10.336Z"
				fill="currentColor"
			/>
			<path d="M18.9375 20.672H29.2735V24.128H18.9375V20.672Z" fill="currentColor" />
			<path d="M31 20.672H41.336V24.128H31V20.672Z" fill="currentColor" />
			<path
				d="M52.6562 0H64.7203V1.728H66.4482V3.456H68.1763V8.608H66.4482V12.064H68.1763V13.792H69.9043V18.944H68.1763V20.672H66.4482V22.4H52.6562V0ZM56.1123 3.456V10.336H62.9923V8.608H64.7203V5.184H62.9923V3.456H56.1123ZM56.1123 13.792V18.944H64.7203V17.216H66.4482V15.52H64.7203V13.792H56.1123Z"
				fill="currentColor"
			/>
			<path
				d="M71.625 0H75.081V3.456H71.625V0ZM71.625 5.152H75.081V22.4H71.625V5.152Z"
				fill="currentColor"
			/>
			<path
				d="M80.2685 10.336H76.8125V6.88H78.5405V5.184H80.2685V1.728H83.7245V5.184H81.9965V6.88H88.9085V10.336H83.7245V18.944H85.4525V17.216H88.9085V20.672H87.1805V22.4H81.9965V20.672H80.2685V10.336Z"
				fill="currentColor"
			/>
			<path
				d="M90.625 6.88H94.081V10.336H90.625V6.88ZM90.625 18.944H94.081V22.4H90.625V18.944Z"
				fill="currentColor"
			/>
			<path
				d="M97.5085 17.216H95.8125V5.184H97.5085V1.728H99.2365V0H109.604V1.728H111.333V5.184H113.061V8.608H109.604V6.88H107.877V3.456H100.965V6.88H99.2365V15.488H100.965V18.944H107.877V15.52H109.604V13.792H113.061V17.216H111.333V20.672H109.604V22.4H99.2685V20.672H97.5085V17.216Z"
				fill="currentColor"
			/>
			<path
				d="M114.781 0H118.237V6.88H119.965V5.152H125.117V6.88H126.845V8.608H128.573V22.4H125.117V10.336H123.389V8.608H121.693V10.336H119.965V12.064H118.237V22.4H114.781V0Z"
				fill="currentColor"
			/>
			<path
				d="M137.193 13.792V15.52H135.464V17.248H133.736V18.944H137.193V17.216H138.921V13.792H137.193ZM132.04 20.672H130.312V15.52H132.04V13.792H133.736V12.064H137.193V10.336H138.921V8.608H133.768V10.336H130.312V6.88H132.04V5.184H140.648V6.88H142.376V18.944H144.105V22.4H140.648V20.672H137.193V22.4H132.04V20.672Z"
				fill="currentColor"
			/>
			<path
				d="M147.612 10.336H144.156V6.88H145.884V5.184H147.612V1.728H151.068V5.184H149.34V6.88H156.252V10.336H151.068V18.944H152.796V17.216H156.252V20.672H154.524V22.4H149.34V20.672H147.612V10.336Z"
				fill="currentColor"
			/>
		</svg>
	</a>

	<button class="transparent locale" popovertarget="locale-popup">
		<Icon name="globe" />
		<span>{t(['locales', locale])}</span>
	</button>

	<div class="locale-popup" id="locale-popup" popover>
		{#each availableLocales as loc (loc)}
			<button class="transparent" on:click={() => changeLocale(loc)} disabled={loc === locale}>
				<Icon name={`flag-${loc}`} />
				{t(['locales', loc])}
			</button>
		{/each}
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		background-color: var(--bg);
		border-bottom: 1px solid var(--stroke);
		padding: 0 1rem;
		height: 3rem;
	}

	.home-link {
		height: 100%;
	}

	.logo {
		color: var(--accent);
		height: 100%;
		padding: 0.75rem 0;
	}

	.locale {
		margin-left: auto;
		anchor-name: --locale-anchor;
	}

	.locale-popup {
		flex-direction: column;
		position: absolute;
		position-anchor: --locale-anchor;
		position-area: bottom span-left;
		background-color: var(--bg);
		border: 1px solid var(--stroke);
		color: var(--white);
		padding: 0.5rem;
		align-items: flex-start;

		&:popover-open {
			display: flex;
		}

		button {
			padding: 0.5rem 0.75rem;
			width: 100%;
			justify-content: flex-start;
		}
	}
</style>
