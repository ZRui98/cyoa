<script lang="ts">
  import { TABS, TITLES } from './Tabs.svelte';
  import { getContext, onDestroy } from 'svelte';
  import type { TitleContext } from './Tabs.svelte';
  import type { Writable } from 'svelte/store';

  export let index: string;
  export let title: string;
  export let style: string = '';
  let selectedIndex = getContext<Writable<string>>(TABS);
  let titles = getContext<TitleContext>(TITLES);
  titles.registerTab(index, title);
  onDestroy(() => titles.unregisterTab(index));
  $: visible = $selectedIndex === index;
</script>

<div style={visible ? `${style}` : `${style};display: none;`}>
  <slot />
</div>
<!-- </div> -->
