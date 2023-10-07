<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext, onDestroy } from 'svelte';
  import type { Writable } from 'svelte/store';
  import Node from '../../../../../../components/ui/Node.svelte';
  import GraphOverview from '../../../../../../components/ui/GraphOverview.svelte';
  import Sidebar from '../../../../../../components/ui/Sidebar.svelte';
  import { adventureStore, currentActiveNode } from '../../../../../../store/adventure';
  export let data: { author: string; adventure: string };

  let open = false;
  let promise: Promise<any>;
  const { getNodeById } = adventureStore;

  $: adventureName = $adventureStore?.name ?? '';

  const layoutStyling = getContext<Writable<string>>('layoutStyling');
  const titleSuffix: Writable<string> = getContext('titleSuffix');

  $: {
    $titleSuffix = adventureName;
  }
  const STATIC_STYLE = 'transition: 0.3s ease-in-out;';
  $: {
    layoutStyling.set(open ? `margin: 0 5%;margin-right: 55%;${STATIC_STYLE}` : STATIC_STYLE);
  }

  onMount(async () => {
    promise = adventureStore.loadAdventure(data.author, data.adventure);
    await promise;
    const node: string = window.location.hash.substring(1);
    if (getNodeById(node)) {
      currentActiveNode.set(node);
    }
  });

  onDestroy(() => {
    layoutStyling.set('');
    adventureStore.clearAdventure();
  });
</script>

<svelte:head>
  <title>{adventureName}</title>
</svelte:head>

<div id="adventure" class:open>
  {#await promise}
    <span>Loading...</span>
  {:then}
    <Node />
  {/await}
</div>
<Sidebar bind:open>
  <GraphOverview />
</Sidebar>

<style>
  #adventure {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    transition: 0.3s ease-in-out;
    justify-content: center;
    height: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
  }

  span {
    font-size: 20;
  }
</style>
