<script lang="ts">
    import { Features, features } from "../../services/features.svelte";
    import Devices from "../components/Devices.svelte";
    import FeaturesDropdown from "../components/FeaturesDropdown.svelte";
    import Icon from "../components/Icon.svelte";
    import ImageBuilder from "../pages/ImageBuilder.svelte";
    import MessageLog from "../pages/MessageLog.svelte";

    let view: "log" | "image-builder" | "code-cracker" | "empty" =
        $state(chooseDefaultView());

    function chooseDefaultView(): typeof view {
        if (features.isActive(Features.Server)) return "log";
        if (features.isActive(Features.ImageBuilder)) return "image-builder";
        if (features.isActive(Features.KodeKnækkeren)) return "code-cracker";
        return "empty";
    }

    // Ensure current view is valid when features change or on init
    $effect(() => {
        if (
            (view === "log" && !features.isActive(Features.Server)) ||
            (view === "image-builder" &&
                !features.isActive(Features.ImageBuilder)) ||
            (view === "code-cracker" &&
                !features.isActive(Features.KodeKnækkeren)) ||
            view === "empty"
        ) {
            view = chooseDefaultView();
        }
    });
</script>

<main>
    <section class="content">
        <header>
            <nav class="feature-navigation">
                <ul>
                    {#if features.isActive(Features.Server)}
                        <li class:active={view === "log"}>
                            <button
                                class="no-style"
                                onclick={() => (view = "log")}
                                ><Icon name="code-block" /> Besked trafik</button
                            >
                        </li>
                    {/if}
                    {#if features.isActive(Features.ImageBuilder)}
                        <li class:active={view === "image-builder"}>
                            <button
                                class="no-style"
                                onclick={() => (view = "image-builder")}
                                ><Icon name="face-grin" /> Billed byggeren</button
                            >
                        </li>
                    {/if}
                    {#if features.isActive(Features.KodeKnækkeren)}
                        <li class:active={view === "code-cracker"}>
                            <button
                                class="no-style"
                                onclick={() => (view = "code-cracker")}
                                ><Icon name="lock-open" /> Kode knækkeren</button
                            >
                        </li>
                    {/if}
                </ul>
            </nav>
            <FeaturesDropdown />
        </header>

        {#if view === "log"}
            <MessageLog />
        {/if}
        {#if view === "image-builder"}
            <ImageBuilder />
        {/if}
        {#if view === "code-cracker"}
            <p>Kode knækkeren er under udvikling</p>
        {/if}
        {#if view === "empty"}
            <div class="empty">
                <p>Vent på instruktioner fra din lærer</p>
            </div>
        {/if}
    </section>

    <section class="devices">
        <h2>Enheder</h2>
        <Devices />
    </section>
</main>

<style>
    main {
        display: grid;
        grid-template-columns: auto 300px;
        padding: 24px;
        height: 100vh;
        box-sizing: border-box;
    }

    section {
        width: 100%;
        height: 100%;
    }

    .content {
        padding-right: 24px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .empty {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .devices {
        border-left: 1px solid var(--muted-grey);
        padding-left: 24px;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
    }

    .feature-navigation ul {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        font: 20px/24px var(--heading);

        li button {
            padding: 6px 12px;
            cursor: pointer;
            border: none;
            background: none;
            border-bottom: 2px solid transparent;
            font: inherit;
            color: inherit;
            display: flex;
            align-items: flex-start;
            gap: 8px;

            &:hover {
                background-color: rgba(0, 0, 0, 0.2);
                border-bottom-color: rgba(0, 0, 0, 0.2);
            }
        }

        li.active button {
            border-bottom-color: var(--white);
            color: var(--accent);

            :global(.icon) {
                color: var(--white);
            }
        }
    }
</style>
