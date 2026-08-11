<script>
	import DialogRenderer from './lib/Components/DialogRenderer.svelte';
	import ChatLayout from './lib/Layouts/ChatLayout.svelte';
	import Default from './lib/Layouts/BaseLayout.svelte';
	import { Features, features } from './services/features.svelte';

	const isTeacherRoute = window.location.pathname.replace(/\/$/, '') === '/teacher';

	$effect(() => {
		document.body.dataset.hacker = features.isActive(Features.Hacker) ? 'true' : 'false';
	});
</script>

<Default>
	{#if isTeacherRoute}
		{#await import('./lib/Pages/TeacherCheatSheet.svelte') then { default: TeacherCheatSheet }}
			<TeacherCheatSheet />
		{/await}
	{:else}
		<ChatLayout />
	{/if}
</Default>

<DialogRenderer />
