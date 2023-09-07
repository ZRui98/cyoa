<script lang="ts">
  import { TABS, TITLES } from './Tabs.svelte';
  import { getContext, onDestroy } from 'svelte';
  import type { TitleContext } from './Tabs.svelte';
  import type { Writable } from 'svelte/store';

  export let index: string;
  export let title: string;
  let selectedIndex = getContext<Writable<string>>(TABS);
  let titles = getContext<TitleContext>(TITLES);
  titles.registerTab(index, title);
  onDestroy(() => titles.unregisterTab(index));
  $: visible = $selectedIndex === index;
</script>

<div style={visible ? '' : 'display: none;'}>
  <slot />
</div>
<!-- </div> -->
