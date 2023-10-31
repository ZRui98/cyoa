<script lang="ts" context="module">
  export type TitleContext = {
    registerTab: (id: string, title: string) => void;
    unregisterTab: (id: string) => void;
  };

  export const TABS = {};
  export const TITLES = {};
</script>

<script lang="ts">
  import { setContext, createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  export let initialIndex = '0';

  const selectedIndex = writable(initialIndex);

  $: {
    dispatch('change', {
      value: {id: $selectedIndex, title: titles[$selectedIndex]}
    });
  }

  setContext(TABS, selectedIndex);
  const titles: { [key: string]: string } = {};
  const dispatch = createEventDispatcher();
  setContext(TITLES, {
    registerTab(id: string, title: string) {
      titles[id] = title;
    },
    unregisterTab(id: string) {
      delete titles[id];
    },
  } as TitleContext);

  function handleChange(newSelected: string) {
    $selectedIndex = newSelected;
  }
</script>

<div class="wrapper" {...$$restProps}>
  <ul>
    {#each Object.keys(titles) as entry}
      <button
        class:selected={$selectedIndex === entry}
        class="tab button-round static-padding"
        on:click={() => handleChange(entry)}>{titles[entry]}</button
      >
    {/each}
  </ul>

  <slot />
</div>

<style>
  ul {
    padding: 0;
    display: flex;
    gap: 10px;
  }

  .tab.selected {
    background-color: hsl(var(--main-surface));
    outline: 2px solid hsl(var(--main-pine));
  }

  .tab {
    font-size: 16px;
    padding: 5px 15px;
  }
</style>
