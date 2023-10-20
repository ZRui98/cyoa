<script lang="ts">
  import { Plus, Save, SlidersHorizontal, Trash2 } from 'lucide-svelte';
  import { onMount, onDestroy } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import { toast } from 'svelte-sonner';

  import {
    isFileAsset,
    isManagedExportableAsset,
    isTextAsset,
    type Asset,
    AssetType,
    type ManagedAssetResponse,
    type ManagedExportableAsset,
  } from '@backend/models/Asset';
  import JsonView from '../../../../components/ui/JsonView.svelte';
  import Accordion from '../../../../components/ui/Accordion.svelte';
  import Tab from '../../../../components/ui/Tab.svelte';
  import Tabs from '../../../../components/ui/Tabs.svelte';
  import GraphOverview from '../../../../components/ui/GraphOverview.svelte';
  import { adventureStore, currentActiveNode } from '../../../../store/adventure';
  import Node from '../../../../components/ui/Node.svelte';
  import loginState from '../../../../store/loginState';
  import Sidebar from '../../../../components/ui/Sidebar.svelte';
  import Dropdown from '../../../../components/ui/Dropdown.svelte';
  import TextPreview from '../../../../components/ui/TextPreview.svelte';
  import { LOREM_IPSUM } from '../../../../components/pixi/constants';
  import { getAssets, saveAdventure, updateAdventure } from '../../../../utils/api';
  import EditorSettings from '../../../../components/ui/menu/EditorSettings.svelte';
  import { settings } from '../../../../store/settings';
  import AssetUpdatePopup from '../../../../components/ui/menu/AssetUpdatePopup.svelte';

  export let data: { adventureName: string };

  const openNodes: {[key: string]: boolean} = {};

  if (!$adventureStore) {
    if (data.adventureName && $loginState?.activated) {
      adventureStore.loadAdventure($loginState.user!, data.adventureName);
    } else {
      adventureStore.initializeAdventure();
    }
  }

  currentActiveNode.subscribe((val) => {
    if ($settings.editor.autoFocus) {
      const el = document?.getElementById(`node-${val?.id}`);
      el?.scrollIntoView({behavior: 'smooth'});
    }

    if ($settings.editor.autoCollapse) {
      for (const key in Object.keys(openNodes)) {
        openNodes[key] = key === val?.id;
      }
    } else if (val) {
      openNodes[val.id] = true;
    }
  })

  $: assetTypes = $loginState?.activated ? Object.keys(AssetType) : [AssetType.FILE, AssetType.TEXT];
  let managedAssets: Writable<ManagedAssetResponse[] | undefined> = writable(undefined);
  let settingsVisible = false;
  let showManagedAssetPopup = false;
  let newManagedAsset: {nodeKey: string, idx: number};

  onMount(() => {
    if ($loginState?.activated) {
      if ($adventureStore) {
        $adventureStore.author = $loginState.user ?? 'anonymous';
      }
      getAssets()
        .then((assets) => {
          $managedAssets = assets;
        })
        .catch(() => ($managedAssets = undefined));
    }
  });

  function addNewNode() {
    if (!$adventureStore?.nodes) return;
    const keys = Object.keys($adventureStore?.nodes).sort((a, b) => {
      return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
    let id = '0';
    if (keys.length > 0) {
      const latestKey = keys[keys.length - 1];
      let x = parseFloat(latestKey);
      const isInt = !isNaN(x) && (x | 0) === x;
      if (isInt) {
        id = `${x + 1}`;
      }
    }
    openNodes[id] = false;
    $adventureStore.nodes[id] = {
      name: id,
      links: [],
      assets: [],
    };
    if (!$adventureStore?.start) {
      $adventureStore.start = id;
    }
  }

  function createNewAsset(type: AssetType): Asset {
    switch (type) {
      case 'MANAGED':
        if ($managedAssets && $managedAssets.length > 0) {
          return { managedAssetId: $managedAssets[0].id };
        }
        return { managedAssetId: '' };
      case 'FILE':
        return { path: 'https://example.com/audio.mp3' };
      case 'TEXT':
        return {
          content: LOREM_IPSUM,
        };
    }
    return {};
  }

  function createNewManagedAsset(nodeKey: string, idx: number) {
    showManagedAssetPopup = true;
    newManagedAsset = {nodeKey, idx};
  }

  function onManagedAssetSave(e: CustomEvent<{oldAsset: ManagedAssetResponse | null, asset: ManagedAssetResponse}>) {
    const newAsset = createNewAsset(AssetType.MANAGED) as ManagedExportableAsset;
    newAsset.managedAssetId = e.detail.asset.id;
    adventureStore.updateAsset(newManagedAsset.nodeKey, newManagedAsset.idx, newAsset);
    managedAssets.update(assets => {
      if (!assets) assets = [];
      assets.push(e.detail.asset);
      return assets;
    });
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
    const uniqueEdges = edges.filter(
      (edge) => !$adventureStore?.nodes[nodeKey].links.some((link) => edge.value === link.next)
    );
    if (uniqueEdges.length > 0)
      adventureStore.addEdge(nodeKey, { prompt: 'Sample Option Text', next: uniqueEdges[0].value! });
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

    const uniqueEdges = ans.filter(
      (edge) => !$adventureStore?.nodes[nodeKey].links.some((link) => edge.value === link.next)
    );
    return uniqueEdges;
  }

  // let content = {
  //   json: adventure
  // } as unknown as Content;

  function handleSave() {
    const existingAdventure = new URLSearchParams(window.location.search).get('adventure_name');
    let promise: Promise<void>;
    if (existingAdventure) {
      promise = updateAdventure(existingAdventure, $adventureStore);
    } else {
      promise = saveAdventure($adventureStore);
    }
    promise.then(() => {
      if ($adventureStore?.name) {
        const url = new URL(window.location.href);
        url.searchParams.set('adventure', $adventureStore.name);
        window.history.pushState(null, '', url.toString());
      }
    });
    toast.promise(promise, {
      duration: 1500,
      loading: 'Loading...',
      success: 'Adventure was saved',
      info: '',
      warning: '',
      error: 'Failed to save adventure!',
    });
  }

  onDestroy(() => {
    adventureStore.clearAdventure();
  });
</script>

{#if $adventureStore}
  <div class="json-preview">
    <div id="title">
      <span>Title: </span>
      <input bind:value={$adventureStore.name} class="static-padding" type="text" />
      <button class="button" on:click={handleSave}><Save display="block" /></button>
    </div>
    <AssetUpdatePopup bind:show={showManagedAssetPopup} on:update={onManagedAssetSave}/>
    <Tabs style="flex: 1">
      <Tab index="0" title="Nodes">
        <EditorSettings bind:settingsVisible showEditorSettings />
        <div id="nodes-options">
          <button class="button-round" on:click={addNewNode}>
            <Plus display="block" />
          </button>
          <button on:click={() => settingsVisible = !settingsVisible} class="button"><SlidersHorizontal display="block" /></button>
        </div>
        {#each Object.keys($adventureStore.nodes) as nodeKey}
          <Accordion id={`node-${nodeKey}`} bind:open={openNodes[nodeKey]} focused={$currentActiveNode?.id === nodeKey}>
            <div class="node" slot="toggle-button">
              {$adventureStore.nodes[nodeKey].name}
              <button class="button" on:click|stopPropagation={() => {adventureStore.removeNode(nodeKey); delete openNodes[nodeKey];}}
                ><Trash2 display="block" /></button
              >
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
                          {#if $managedAssets && $managedAssets.length > 0}
                            {@const managedAssetId = asset.managedAssetId}
                            {@const fileName = $managedAssets.find(a => a.id === managedAssetId)?.name ?? ''}
                            <Dropdown
                              text={fileName}
                              value={asset}
                              on:change={(e) => adventureStore.updateAsset(nodeKey, i, e.detail.value)}
                              options={$managedAssets.map((a) => ({
                                text: a.name,
                                value: { managedAssetId: a.id },
                              }))}
                            />
                          {:else}
                            <div>No <a href="/assets">assets</a> available.</div>
                          {/if}
                          <button class="button" on:click={() => createNewManagedAsset(nodeKey, i)}><Plus /></button>
                        {:else if isFileAsset(asset)}
                          <input type="text" bind:value={asset.path} style="flex-grow:1;" />
                        {/if}
                        <Dropdown
                          text={getAssetType(asset)}
                          on:change={(e) => changeAssetType(e, nodeKey, i)}
                          options={assetTypes.map((type) => ({ text: type }))}
                          style={'font-size:12px;min-width:90px;width:90px;align-self:center'}
                        />
                      </div>
                      <button class="button" on:click|stopPropagation={() => adventureStore.removeAsset(nodeKey, i)}
                        ><Trash2 /></button
                      >
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
                      <button class="button" on:click|stopPropagation={() => adventureStore.removeEdge(nodeKey, link)}
                        ><Trash2 /></button
                      >
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
      <Tab index="2" title="Preview" style="flex:1;display:flex">
        <Node />
      </Tab>
    </Tabs>
    <!-- <div>

      <JSONEditor bind:content mainMenuBar={true} readOnly onError={() => {}}/>
    </div> -->
  </div>

    <Sidebar open={true}>
      <GraphOverview />
    </Sidebar>
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
    display: flex;
    flex-direction: column;
    flex: 1;
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

  #nodes-options {
    display: flex;
    align-items: center;
    gap: 20px;
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
