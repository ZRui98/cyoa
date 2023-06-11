<script lang="ts">
    import { ChevronRight } from "lucide-svelte";
import { slide } from "svelte/transition";
    export let open = false;
    $: chevronstyle = `
        ${open ? 'transform: rotate(0.25turn);': ''}transition: transform 0.1s ease-in;;
    `;
</script>

<div id="container" class="static-padding" {...$$restProps}>
    <div class="card static-padding" id="accordion-button" aria-expanded={open}
        on:click={() => open = !open}
        on:keydown|self={(e) => e.code === 'Enter' ?? (open = !open)}
    >
        <ChevronRight style={chevronstyle} aria-expanded={open}/>
        <slot name="toggle-button">
            <div>Expand</div>
        </slot>
    </div>
    {#if open}
    <div id="accordion-content" class="static-padding" transition:slide|local={{duration: 300}}>
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
        align-items: center;
    }

    #container {
        display: flex;
        width: 100%;
        margin: 10px 0;
        flex-direction: column;
        background-color: var(--main-highlight-low);
        border: 1px solid var(--main-highlight-high);
        border-radius: 10px;
    }

    #accordion-content {
        border-radius: 10px;
        background-color: var(--main-highlight-low);
        width: 100%;
        padding: 20px;
    }
</style>