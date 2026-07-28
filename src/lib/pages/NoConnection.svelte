<script>
    import { microbitService } from "../../services/microbit.svelte";
</script>

<main>
    <h1>Ingen enhed forbundet</h1>
    <button onclick={() => microbitService.connect()}>Forbind micro:bit</button>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
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
