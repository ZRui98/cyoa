<script>
  import { Component, X } from 'lucide-svelte';

  export let open = false;
</script>

<div>
  <button class="toggle-button" on:click="{() => open = !open}">
    {#if open}
      <X />
    {:else}
      <Component />
    {/if}
  </button>
  <aside class:open>
    <slot />
  </aside>
</div>

<style>
  aside {
    right: -100%;
    transition: right 0.3s ease-in-out;
    width: 50%;
    height: 100%;
    position: absolute;
    top: 0;
    justify-content:center;
    display: flex;
  }

  .toggle-button {
    z-index: 1;
    position: absolute;
    top: 0px;
    right: 0px;
  }

  .open {
    right: 0;
  }
</style>