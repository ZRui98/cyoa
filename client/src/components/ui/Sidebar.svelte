<script lang="ts">
  import { getContext, onDestroy } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { Component, Settings, X } from 'lucide-svelte';
  import EditorSettings from './menu/EditorSettings.svelte';

  export let open = false;
  let settingsVisible = false;

  const STATIC_STYLE = 'transition: 0.3s ease-in-out;';
  const layoutStyling = getContext<Writable<string>>('layoutStyling');
  $: {
    layoutStyling.set(open ? `margin: 0 5%;margin-right: 55%;${STATIC_STYLE}` : STATIC_STYLE);
  }

  onDestroy(() => {
    layoutStyling.set('');
  });
</script>

<EditorSettings bind:settingsVisible />
<div>
  <button class="toggle-button" style={open ? 'color: hsl(var(--main-subtle))' : ''} on:click={() => (open = !open)}>
    {#if open}
      <X display="block" />
    {:else}
      <Component display="block" />
    {/if}
  </button>
  <button
    id="settings"
    class="toggle-button"
    style={open ? 'color: hsl(var(--main-subtle))' : ''}
    on:click={() => (settingsVisible = !settingsVisible)}><Settings display="block" /></button
  >
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
    position: fixed;
    top: 0;
    justify-content: center;
    display: flex;
    flex-direction: column;
    outline: 2px solid hsl(var(--main-highlight-high));
  }

  .toggle-button {
    z-index: 1;
    position: fixed;
    top: 20px;
    right: 20px;
  }

  #settings {
    top: 20px;
    right: 60px;
  }

  aside.open {
    right: 0;
  }
</style>
