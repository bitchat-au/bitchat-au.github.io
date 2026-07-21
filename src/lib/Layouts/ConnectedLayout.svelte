<script>
    import { Features, features } from "../../services/features.svelte";
    import { microbitService } from "../../services/microbit.svelte";
    import FeaturesDropdown from "../components/FeaturesDropdown.svelte";
    import Icon from "../components/Icon.svelte";
    import MessageLog from "../pages/MessageLog.svelte";
</script>

<main>
    <section class="content">
        <header>
            <nav class="feature-navigation">
                <ul>
                    {#if features.isActive(Features.Server)}
                        <li class="active">
                            <button class="no-style"
                                ><Icon name="code-block" /> Besked trafik</button
                            >
                        </li>
                    {/if}
                    {#if features.isActive(Features.ImageBuilder)}
                        <li>
                            <button class="no-style"
                                ><Icon name="face-grin" /> Billed byggeren</button
                            >
                        </li>
                    {/if}
                    {#if features.isActive(Features.KodeKnækkeren)}
                        <li>
                            <button class="no-style"
                                ><Icon name="lock-open" /> Kode knækkeren</button
                            >
                        </li>
                    {/if}
                </ul>
            </nav>
            <FeaturesDropdown />
        </header>
        <!-- Default feature content -->
         <MessageLog />
        <button onclick={() => microbitService.connect().then(() => microbitService.writeToMB("start"))}>Connect to device</button>
    </section>

    <section class="devices">
        <h2>Enheder</h2>
        <!-- List of devices -->
    </section>
</main>

<style>
    main {
        display: grid;
        grid-template-columns: auto 350px;
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
    }

    .devices {
        border-left: 1px solid var(--muted-grey);
        padding-left: 24px;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
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
