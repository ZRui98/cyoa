<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext, onDestroy } from 'svelte';
  import type { Writable } from 'svelte/store';
  import Node from '../../../../../../components/ui/components/Node.svelte';
  import GraphOverview from '../../../../../../components/ui/pixi/GraphOverview.svelte';
  import Sidebar from '../../../../../../components/ui/Sidebar.svelte';
  import { adventureStore, currentActiveNode } from '../../../../../../store/adventure';
  export let data: { author: string; adventure: string };
  let promise: Promise<any>;
  const { getNodeById } = adventureStore;

  $: adventureName = $adventureStore?.name ?? '';

  const titleSuffix: Writable<string> = getContext('titleSuffix');

  $: {
    $titleSuffix = adventureName;
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
<Sidebar open={false}>
  <GraphOverview />
</Sidebar>

<style>
  #adventure {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    transition: 0.3s ease-in-out;
    justify-content: center;
    min-height: 0px;
    height: 100%;
  }

  span {
    font-size: 20;
  }
</style>
