<script lang="ts">
    import { friendlyLogService } from "../../services/friendly_log.svelte";
    import Icon from "../components/Icon.svelte";
    import LogEntryRenderer from "../components/LogEntryRenderer.svelte";
</script>

<div>
    <samp>
        Bit:Chat Server
        {#each friendlyLogService.logs as log}
            <LogEntryRenderer entry={log} />
        {/each}
    </samp>
    <footer>
        <button
            class="transparent"
            onclick={() => friendlyLogService.clearLogs()}
        >
            Clear Logs
            <Icon name="trash-alt" />
        </button>
    </footer>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        position: relative;
    }

    samp {
        display: flex;
        flex-direction: column;
        background-color: black;
        padding: 0.5rem;
        width: 100%;
        flex-grow: 1;
        overflow: scroll;
    }

    footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
    }
</style>
