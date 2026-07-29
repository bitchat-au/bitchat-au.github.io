<script lang="ts">
    import {
        openDialogs,
        registeredDialogs,
        resolveDialog,
    } from "../../services/dialog_manager.svelte";
</script>

{#each openDialogs as openDialog}
    <svelte:component
        this={registeredDialogs[openDialog.dialogRef]}
        id={openDialog.id}
        data={openDialog.data}
        onClose={() => resolveDialog(openDialog, { type: "closed" })}
        onError={(err) => resolveDialog(openDialog, { type: "error", error: err })}
        onResult={(result) => resolveDialog(openDialog, { type: "success", data: result })}
    />
{/each}