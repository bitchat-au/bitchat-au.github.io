<script lang="ts">
    import { dialogManager } from "../../services/dialog_manager.svelte";
</script>

{#each dialogManager.openDialogs as openDialog}
    <svelte:component
        this={openDialog.Component}
        dialogRef={openDialog.dialogRef}
        data={openDialog.data}
        onClose={() => dialogManager.resolveDialog(openDialog, { type: "closed" })}
        onError={(err) => dialogManager.resolveDialog(openDialog, { type: "error", error: err })}
        onResult={(result) => dialogManager.resolveDialog(openDialog, { type: "success", data: result })}
    />
{/each}