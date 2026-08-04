<script>
    import { t } from "@i18n";
    import { microbitService } from "../../services/microbit.svelte";
</script>

<main>
    <h1>{t("welcome.noConnection")}</h1>
    <button onclick={() => microbitService.connect()}>{t("welcome.connect")}</button>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        cursor: pointer;
    }
</style>
