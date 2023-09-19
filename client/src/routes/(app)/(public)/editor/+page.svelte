<script lang="ts">
  import { Plus, Save, Trash2 } from 'lucide-svelte';
  import { getContext, onDestroy } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { isFileAsset, isManagedExportableAsset, isTextAsset, type Asset, AssetType, type AssetResponse } from '@backend/models/Asset';
  import JsonView from '../../../../components/ui/JsonView.svelte';
  import Accordion from '../../../../components/ui/Accordion.svelte';
  import Tab from '../../../../components/ui/Tab.svelte';
  import Tabs from '../../../../components/ui/Tabs.svelte';
  import GraphOverview from '../../../../components/ui/GraphOverview.svelte';
  import { adventureStore } from '../../../../store/adventure';
  import Node from '../../../../components/ui/Node.svelte';
  import loginState from '../../../../store/loginState';
  import Sidebar from '../../../../components/ui/Sidebar.svelte';
  import Dropdown from '../../../../components/ui/Dropdown.svelte';
  import TextPreview from '../../../../components/ui/TextPreview.svelte';
  import { LOREM_IPSUM } from '../../../../components/pixi/constants';
  import { toast } from 'svelte-sonner';
  import { getAssets, saveAdventure } from '../../../../utils/api';

  if (!$adventureStore) {
    adventureStore.initializeAdventure();
  }

  const layoutStyling = getContext<Writable<string>>('layoutStyling');
  const STATIC_STYLE = 'transition: 0.3s ease-in-out;';
  let open = true;
  $: {
    layoutStyling.set(open ? `margin: 0 5%;margin-right: 55%;${STATIC_STYLE}` : STATIC_STYLE);
  }

  $: assetTypes = $loginState?.activated ? Object.keys(AssetType) : [AssetType.FILE, AssetType.TEXT];
  let managedAssets: AssetResponse[] | undefined = undefined;
  $: {
    if ($loginState?.activated) {
      console.log($loginState);
      getAssets().then(assets => {console.log(assets); managedAssets = assets}).catch(() => managedAssets = undefined)
    }
  }

  function addNewNode() {
    if (!$adventureStore?.nodes) return;
    const keys = Object.keys($adventureStore?.nodes).sort();
    let id = '0';
    if (keys.length > 0) {
      const latestKey = keys[keys.length - 1];
      let x = parseFloat(latestKey);
      const isInt = !isNaN(x) && (x | 0) === x;
      if (isInt) {
        id = `${x + 1}`;
      }
    }

    $adventureStore.nodes[id] = {
      name: 'new node',
      links: [],
      assets: [],
    };
  }

  function createNewAsset(type: AssetType): Asset {
    switch (type) {
      case 'MANAGED':
        if (!managedAssets) {
          throw new Error('No assets were loaded');
        }
        return {managedAssetName: managedAssets[0].name, path: managedAssets[0].path};
      case 'FILE':
        return { path: 'https://example.com/audio.mp3' };
      case 'TEXT':
        return {
          content: LOREM_IPSUM
        };
    }
    return {};
  }

  function getAssetType(asset: Asset): AssetType {
    if (isManagedExportableAsset(asset)) {
      return 'MANAGED';
    }
    if (isFileAsset(asset)) {
      return 'FILE';
    }
    return 'TEXT';
  }

  function changeAssetType(event: CustomEvent<{ oldValue: AssetType; value: AssetType }>, nodeKey: string, i: number) {
    const newAsset = createNewAsset(event.detail.value);
    adventureStore.updateAsset(nodeKey, i, newAsset);
  }

  function addNewEdge(nodeKey: string) {
    const edges = getPossibleEdgesForNode(nodeKey);
    const uniqueEdges = edges.filter(edge => !$adventureStore?.nodes[nodeKey].links.some(link => edge.value === link.next));
    if (uniqueEdges.length > 0) adventureStore.addEdge(nodeKey, { prompt: 'Sample Option Text', next: uniqueEdges[0].value! });
  }

  function getPossibleEdgesForNode(nodeKey: string): { text: string; value?: string }[] {
    if (!$adventureStore) return [];
    const ans = Object.keys($adventureStore.nodes)
      .filter((val) => val !== nodeKey)
      .reduce((acc: { text: string; value?: string }[], curr) => {
        if (!$adventureStore) return acc;
        acc.push({ text: $adventureStore.nodes[curr].name, value: curr });
        return acc;
      }, []);
    
    const uniqueEdges = ans.filter(edge => !$adventureStore?.nodes[nodeKey].links.some(link => edge.value === link.next));
    return uniqueEdges;
  }

  // let content = {
  //   json: adventure
  // } as unknown as Content;

  function handleSave() {
    const promise = saveAdventure($adventureStore);
    toast.promise(promise, {
      duration: 1500,
      loading: 'Loading...',
      success: 'Adventure was saved',
      info: '',
      warning: '',
      error: 'Failed to save adventure!',
    })
  }

  onDestroy(() => {
    layoutStyling.set('');
    adventureStore.clearAdventure();
  });
</script>

{#if $adventureStore}
  <div class="json-preview">
    <div id="title">
      <span>Title: </span>
      <input bind:value={$adventureStore.name} class="static-padding" type="text" />
      <button class="button" on:click={handleSave}><Save /></button>
    </div>
    <Tabs style="flex: 1 1 auto;">
      <Tab index="0" title="Nodes">
        <button class="button-round" on:click={addNewNode}>
          <Plus />
        </button>
        {#each Object.keys($adventureStore.nodes) as nodeKey}
          <Accordion>
            <div class="node" slot="toggle-button">
              {$adventureStore.nodes[nodeKey].name}
              <button class="button" on:click|stopPropagation={() => adventureStore.removeNode(nodeKey)}><Trash2 /></button>
            </div>
            <div slot="toggle-content">
              <input bind:value={$adventureStore.nodes[nodeKey].name} class="static-padding" type="text" />
              <div>
                <h2>
                  Content
                  <button
                    class="button-round"
                    on:click={() => adventureStore.addAsset(nodeKey, createNewAsset('TEXT'))}
                  >
                    <Plus />
                  </button>
                </h2>
                <div class="content">
                  {#each $adventureStore.nodes[nodeKey].assets as asset, i}
                    <div class="row">
                      <div class="group">
                        {#if isTextAsset(asset)}
                          <TextPreview bind:value={asset.content} style="flex-grow:1;" />
                        {:else if isManagedExportableAsset(asset)}
                          {#if managedAssets && managedAssets.length > 0}
                            <Dropdown
                              text={asset.managedAssetName}
                              bind:value={asset}
                              options={managedAssets.map(a => ({text: a.name, value: {managedAssetName: a.name, path: a.path}}))}
                            />
                          {:else}
                            No Assets available. Add some <a href="/assets">here</a>
                          {/if}
                        {:else if isFileAsset(asset)}
                          <input type="text" bind:value={asset.path} style="flex-grow:1;"/>
                        {/if}
                        <Dropdown
                          text={getAssetType(asset)}
                          on:change={(e) => changeAssetType(e, nodeKey, i)}
                          options={assetTypes.map((type) => ({ text: type }))}
                          style={'font-size:12px;min-width:90px;width:90px;align-self:center'}
                        />
                      </div>
                      <button class="button" on:click|stopPropagation={() => adventureStore.removeAsset(nodeKey, i)}><Trash2 /></button>
                    </div>
                  {/each}
                </div>
              </div>
              <div>
                <h2>
                  Goes To
                  <button class="button-round" on:click={() => addNewEdge(nodeKey)}>
                    <Plus />
                  </button>
                </h2>
                <div class="links">
                  {#each $adventureStore.nodes[nodeKey].links as link}
                    <div class="row">
                      <div class="group">
                        <input type="text" bind:value={link.prompt} style="flex-grow:1;" />
                        <Dropdown
                          bind:value={link.next}
                          text={$adventureStore.nodes[link.next].name}
                          options={getPossibleEdgesForNode(nodeKey)}
                          style={'font-size:12px;min-width:90px;;width:90px;align-self:center'}
                        />
                      </div>
                      <button class="button" on:click|stopPropagation={() => adventureStore.removeEdge(nodeKey, link)}><Trash2 /></button>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </Accordion>
        {/each}
      </Tab>
      <Tab index="1" title="JSON">
        <JsonView json={$adventureStore} />
      </Tab>
      <Tab index="2" title="Preview">
        <Node />
      </Tab>
    </Tabs>

    <div id="preview">
      <div />
      <Sidebar bind:open>
        <GraphOverview />
      </Sidebar>
    </div>
    <!-- <div>

      <JSONEditor bind:content mainMenuBar={true} readOnly onError={() => {}}/>
    </div> -->
  </div>
{/if}

<style>
  .json-preview {
    --jse-key-color: hsl(var(--main-fg));
    --jse-value-color: hsl(var(--main-fg));
    --jse-value-color-number: hsl(var(--main-love));
    --jse-value-color-boolean: hsl(var(--main-pine));
    --jse-value-color-null: #004ed0;
    --jse-value-color-string: hsl(var(--main-gold));
    --jse-value-color-url: #008000;
    --jse-delimiter-color: rgba(0, 0, 0, 0.38);
    --jse-edit-outline: 2px solid #656565;
    --jse-selection-background-color: hsl(var(--main-highlight-low));
    --jse-background-color: hsl(var(--main-bg));
    height: 100%;
    display: flex;
    flex-flow: column;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .button-round {
    width: 44px;
    height: 44px;
    padding: 0;
  }

  #preview {
    width: 100%;
    display: flex;
    flex-flow: row;
    height: 100%;
  }

  #preview > div {
    display: flex;
    flex-flow: column;
    width: 100%;
    height: 100%;
  }

  #title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .links {
    flex-direction: column;
    display: flex;
  }

  .node,
  .row {
    display: flex;
    align-items: flex-start;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .row .group {
    display: flex;
    gap: 20px;
    align-items: center;
    max-width: 90%;
    width: 90%;
  }
</style>
