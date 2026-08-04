<script lang="ts">
    import { t } from "@i18n";
    import { friendlyLogService } from "../../services/friendly_log.svelte";
    import Icon from "../Components/Icon.svelte";
    import LogEntryRenderer from "../Components/LogEntryRenderer.svelte";
</script>

<div>
    <samp>
        {t("messageLogs.serverTitle")}
        {#each friendlyLogService.logs as log}
            <LogEntryRenderer entry={log} />
        {/each}
    </samp>
    <footer>
        <button
            class="transparent"
            onclick={() => friendlyLogService.clearLogs()}
        >
            {t("messageLogs.clearLog")}
            <Icon name="trash-alt" />
        </button>
    </footer>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: relative;
        background: black;
    }

    samp {
        display: flex;
        flex-direction: column;
        background-color: black;
        padding: 0.5rem;
        width: 100%;
        flex-grow: 1;
        overflow: auto;
        scrollbar-color: var(--muted-grey) black;
        scrollbar-width: thin;
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
