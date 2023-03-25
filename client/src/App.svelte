<script lang="ts">
    import { Moon } from "lucide-svelte";
    import { Lightbulb } from "lucide-svelte";
    import GraphOverview from "./components/GraphOverview.svelte";
    import Sidebar from "./components/ui/Sidebar.svelte";
    let open = false;
    let darkMode: boolean = false;
</script>

<main>
    <div id="container" class:open>
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
    }
    
    
</style>