<script>
	import Header from '../Components/Header.svelte';

	const { children } = $props();
</script>

<Header />
{@render children?.()}

<style>
	:global(main) {
		height: calc(100vh - 3rem);
	}
</style>
