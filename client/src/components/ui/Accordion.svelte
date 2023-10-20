<script lang="ts">
  import { ChevronRight } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  export let open = false;
  export let focused = false;
  export let contentStyle = '';
  export let buttonStyle = '';
  export let chevronSize = 24;
  $: chevronstyle = `
        ${open ? 'transform: rotate(0.25turn);' : ''}transition: transform 0.1s ease-in;
    `;
</script>

<div class={`container static-padding ${focused ? 'focused' : ''}`} {...$$restProps}>
  <div
    class="card static-padding"
    id="accordion-button"
    style={buttonStyle}
    aria-expanded={open}
    role="button"
    tabindex="0"
    aria-roledescription="expand/collapse"
    on:click={() => (open = !open)}
    on:keydown|self={(e) => e.code === 'Enter' ?? (open = !open)}
  >
    <ChevronRight display="block" size={chevronSize} style={chevronstyle} aria-expanded={open} />
    <slot name="toggle-button">
      <div>Expand</div>
    </slot>
  </div>
  {#if open}
    <div id="accordion-content" class="static-padding" style={contentStyle} transition:slide|local={{ duration: 200 }}>
      <slot name="toggle-content" />
    </div>
  {/if}
</div>

<style>
  .focused {
    outline: 2px solid hsl(var(--main-pine));
  }

  #accordion-button {
    width: 100%;
    display: flex;
    flex-direction: row;
    cursor: pointer;
    align-items: center;
  }

  .container {
    width: 100%;
    margin: 10px 0;
    background-color: hsl(var(--main-highlight-low));
    border: 1px solid hsl(var(--main-highlight-high));
    border-radius: 10px;
  }

  #accordion-content {
    border-radius: 10px;
    background-color: hsl(var(--main-highlight-low));
    width: 100%;
    padding: 20px 40px;
  }
</style>
