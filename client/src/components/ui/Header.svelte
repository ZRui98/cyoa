<script lang="ts">
    import { Moon, User } from "lucide-svelte";
    import { Lightbulb } from "lucide-svelte";
    let darkMode: boolean = false;
</script>

<header>
    <div>
        <a href="/" class="button static-padding">Home</a>
        <a href="/login" class="button static-padding">Login</a>
        <a href="/signup" class="button static-padding">Upload</a>
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
    }

    .left-panel {
        color: var(--main-fg);
    }

</style>