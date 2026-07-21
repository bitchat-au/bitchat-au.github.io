<script lang="ts">
    import { friendlyLogService } from "../../services/friendly_log.svelte";
    import LogEntryRenderer from "../components/LogEntryRenderer.svelte";
</script>

<samp>
    {#each friendlyLogService.logs as log}
        <LogEntryRenderer entry={log} />
    {/each}
</samp>

<style>
    samp {
        display: flex;
        flex-direction: column;
        background-color: black;
        padding: 0.5rem;
        width: 100%;
        flex-grow: 1;
    }
</style>
