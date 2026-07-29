<script>
    import DialogRenderer from "./lib/Components/DialogRenderer.svelte";
    import ConnectedLayout from "./lib/Layouts/ConnectedLayout.svelte";
    import NoConnection from "./lib/Pages/NoConnection.svelte";
    import { microbitService } from "./services/microbit.svelte";

</script>

{#if microbitService.connected}
    <ConnectedLayout />
{:else}
    <NoConnection />
{/if}

<DialogRenderer />