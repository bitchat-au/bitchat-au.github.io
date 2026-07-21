<script lang="ts">
    import { friendlyLogService } from "../../services/friendly_log.svelte";
</script>

<pre>
{friendlyLogService.logs.map(log => friendlyLogService.formatLogEntry(log)).join("\n")}
</pre>

<style>
    pre {
        background-color: black;
        padding: 0.5rem;
    }
</style>