<script>
    import Icon from "../components/Icon.svelte";
</script>

<main>
    <section class="content">
        <nav class="feature-navigation">
            <ul>
                <li class="active">
                    <button><Icon name="code-block" /> Besked trafik</button>
                </li>
                <li>
                    <button><Icon name="face-grin" /> Billed byggeren</button>
                </li>
                <li>
                    <button><Icon name="lock-open" /> Kode knækkeren</button>
                </li>
            </ul>
        </nav>
        <!-- Default feature content -->
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
