<script lang="ts">
    import { Moon } from "lucide-svelte";
    import { Lightbulb } from "lucide-svelte";
    import GraphOverview from "../components/ui/GraphOverview.svelte";
    import Node from "../components/ui/Node.svelte";
    import Sidebar from "../components/ui/Sidebar.svelte";
    import { onMount } from "svelte";
    import { adventureStore } from "../store/adventure";
    let open = false;
    let darkMode: boolean = false;
    let promise: Promise<any>;
    onMount(() => {
      promise = adventureStore.setAdventure("");
    })
</script>

<main>
    <div id="container" class:open>
        <div id="content">
            <header>
                <button
                    on:click="{
                        () => {
                            window.document.querySelector("html").toggleAttribute('dark-mode');
                            darkMode = !darkMode;
                        }
                    }"
                >
                    {#if darkMode}
                        <Lightbulb />
                    {:else}
                        <Moon />
                    {/if}
                </button>
            </header>
            <Node />
        </div>
    </div>
    <Sidebar bind:open>
        <GraphOverview/>
    </Sidebar>
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        display: flex;
    }

    #container.open {
        margin-right: 50%;
    }

    #container {
        transition: 0.3s ease-in-out;
        justify-content: center;
        width: 100%;
    }

    #content {
        margin: 0 10%;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        height: 100%;
    }
</style>
