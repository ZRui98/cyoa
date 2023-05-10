<script lang="ts">
    import { Moon, User } from "lucide-svelte";
    import { Lightbulb } from "lucide-svelte";
    import loginState from "../../store/loginState";

    $: loggedIn = $loginState?.username !== undefined;
    let darkMode: boolean = false;
</script>

<header>
    <div>
        <a href="/" class="button">Home</a>
        {#if loggedIn }
        <a href="/assets" class="button static-padding">Assets</a>
        <a href="/adventures" class="button static-padding">Adventures</a>
        {:else}
            <a href="/login" class="button static-padding">Log in</a>
            <a href="/signup" class="button static-padding">Sign up</a>
        {/if}
    </div>
    <div class="left-panel">
        <button
            class="button"
            on:click="{
                () => {
                    window.document.querySelector("html")?.toggleAttribute('dark-mode');
                    darkMode = !darkMode;
                }
            }"
        >
            {#if darkMode}
                <Lightbulb size={21}/>
            {:else}
                <Moon size={21}/>
            {/if}
        </button>
        <a class="left-panel button" href="/user/me"><User size={21}/></a>
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

    a {
        height: auto;
        font-size: 20px;
    }

    .left-panel, .left-panel .button {
        color: var(--main-fg);
    }

</style>