<script lang="ts">
    import { ChevronDown, ChevronRight } from "lucide-svelte";
import { slide } from "svelte/transition";
    export let open = false;
    $: chevronstyle = `
        ${open ? 'transform: rotate(0.25turn);': ''}transition: transform 0.1s ease-in;;
    `;
</script>

<div id="container">
    <div class="card" id="accordion-button" aria-expanded={open}
        on:click={() => open = !open}
        on:keydown|self={(e) => e.code === 'Enter' ?? (open = !open)}
    >
        <ChevronRight style={chevronstyle} aria-expanded={open}/>
        <slot name="toggle-button">
            <div>Expand</div>
        </slot>
    </div>
    {#if open}
    <div transition:slide={{duration: 300}}>
        <slot name="toggle-content"/>
    </div>
    {/if}
</div>

<style>
    #accordion-button {
        width: 100%;
        display: flex;
        flex-direction: row;
        cursor: pointer;
    }

    #container {
        display: flex;
        width: 100%;
        padding: 50px 0;
        flex-direction: column;
    }
</style>