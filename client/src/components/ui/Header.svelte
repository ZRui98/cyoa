<script lang="ts">
    import { Moon, User } from "lucide-svelte";
    import { Lightbulb } from "lucide-svelte";
    let darkMode: boolean = false;
</script>

<header>
    <div>
        <a href="/" class="button">Home</a>
        <a href="/login" class="button">Login</a>
        <a href="/signup" class="button">Upload</a>
    </div>
    <div class="left-panel">
        <button
            on:click="{
                () => {
                    window.document.querySelector("html")?.toggleAttribute('dark-mode');
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
        <a class="left-panel" href="/user/me"><User/></a>
    </div>

</header>


<style>
    header {
        display: flex;
        flex-direction: row;
        padding-top: 20px;
        padding-bottom: 20px;
        justify-content: space-between;
        margin-left: -10px;
        margin-right: -10px;
    }

    .left-panel {
        color: var(--main-fg);
    }

</style>