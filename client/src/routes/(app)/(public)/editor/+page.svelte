<script lang="ts">
  import { Plus, Save, SlidersHorizontal, Trash2 } from 'lucide-svelte';
  import { JSONEditor, type Content, Mode, type OnChangeStatus } from 'svelte-jsoneditor';
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

  const openNodes: { [key: string]: boolean } = {};

  if (!$adventureStore) {
    if (data.adventureName && $loginState?.activated) {
      adventureStore.loadAdventure($loginState.user!, data.adventureName);
    } else {
      adventureStore.initializeAdventure();
    }
  }

  $: assetTypes = $loginState?.activated ? Object.keys(AssetType) : [AssetType.FILE, AssetType.TEXT];
  let managedAssets: Writable<ManagedAssetResponse[] | undefined> = writable(undefined);
  let settingsVisible = false;
  let showManagedAssetPopup = false;
  let newManagedAsset: { nodeKey: string; idx: number };

  onMount(() => {
    currentActiveNode.subscribe((val) => {
      if ($settings.editor.autoFocus && document) {
        const el = document?.getElementById(`node-${val?.id}`);
        el?.scrollIntoView({ behavior: 'smooth' });
      }

      if ($settings.editor.autoCollapse) {
        for (const key in Object.keys(openNodes)) {
          openNodes[key] = key === val?.id;
        }
      } else if (val) {
        openNodes[val.id] = true;
      }
    });

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
        sensitivity: 'base',
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
    newManagedAsset = { nodeKey, idx };
  }

  function onManagedAssetSave(e: CustomEvent<{ oldAsset: ManagedAssetResponse | null; asset: ManagedAssetResponse }>) {
    const newAsset = createNewAsset(AssetType.MANAGED) as ManagedExportableAsset;
    newAsset.managedAssetId = e.detail.asset.id;
    adventureStore.updateAsset(newManagedAsset.nodeKey, newManagedAsset.idx, newAsset);
    managedAssets.update((assets) => {
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

  const currentTab = writable('0');
  function handleEditorModeChange(event: CustomEvent<{value: {id: string, title: string}}>) {
    $currentTab = event.detail.value.id;
  }

  let content: Content;
  $: {
    if ($currentTab === '0') {
      content = {
        text: JSON.stringify($adventureStore, null, 2)
      } as Content;
    }
  }

  function onJSONUpdate(content: Content, prevContent: Content, status: OnChangeStatus) {
    if (status.contentErrors) {
      return;
    }
    const { text } = content as {text?: string};
    if (text) {
      const newContent = JSON.parse(text);
      $adventureStore = newContent;
    }
  }

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
  <div id="title">
    <span>Title: </span>
    <input bind:value={$adventureStore.name} class="static-padding" type="text" />
    <button class="button" on:click={handleSave}><Save display="block" /></button>
  </div>
  <AssetUpdatePopup bind:show={showManagedAssetPopup} on:update={onManagedAssetSave} />
  <Tabs style="height:100%;display:flex;flex-direction:column;" on:change={handleEditorModeChange}>
    <Tab index="0" title="Nodes">
      <EditorSettings bind:settingsVisible showEditorSettings />
      <div id="nodes-options">
        <button class="button-round" on:click={addNewNode}>
          <Plus display="block" />
        </button>
        <button on:click={() => (settingsVisible = !settingsVisible)} class="button"
          ><SlidersHorizontal display="block" /></button
        >
      </div>
      {#each Object.keys($adventureStore.nodes) as nodeKey}
        <Accordion id={`node-${nodeKey}`} bind:open={openNodes[nodeKey]} focused={$currentActiveNode?.id === nodeKey}>
          <div class="node" slot="toggle-button">
            {$adventureStore.nodes[nodeKey].name}
            <button
              class="button"
              on:click|stopPropagation={() => {
                adventureStore.removeNode(nodeKey);
                delete openNodes[nodeKey];
              }}><Trash2 display="block" /></button
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
                          {@const fileName = $managedAssets.find((a) => a.id === managedAssetId)?.name ?? ''}
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
                Goes to
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
    <Tab index="1" title="JSON" style="position:relative;height:90%;">
      <div class="json-preview">
        <JSONEditor
          content={content}
          onChange={onJSONUpdate}
          mainMenuBar={false}
          navigationBar={false}
          mode={Mode.text}
          askToFormat={false}
          onError={(e) => console.log(e)}
        />
      </div>
      <!-- <JsonView json={$adventureStore} /> -->
    </Tab>
  </Tabs>
  <!-- <div>

  </div> -->

  <Sidebar open={true}>
    <GraphOverview />
    <div class="adventure-wrapper">
      <Node style="position:absolute; height: 100%;width:100%;"/>
    </div>
  </Sidebar>
{/if}

<style>
  :global(.cm-focused .cm-matchingBracket) {
    background-color: hsl(var(--main-subtle), 0.4) !important;
  }

  .adventure-wrapper {
    position: relative;
    /* height:50%; */
    flex-grow: 1;
    display: flex;
    overflow-y: auto;
  }

  .json-preview {
    --jse-theme-color: hsl(var(--main-bg));
    --jse-theme-color-highlight: hsl(var(--main-highlight-high));
    --jse-key-color: hsl(var(--main-fg));
    --jse-value-color: hsl(var(--main-fg));
    --jse-value-color-number: hsl(var(--main-love));
    --jse-value-color-boolean: hsl(var(--main-pine));
    --jse-value-color-null: hsl(var(--main-iris));
    --jse-value-color-string: hsl(var(--main-gold));
    --jse-value-color-url: hsl(var(--main-rose));
    --jse-delimiter-color: hsl(var(--main-pine));
    --jse-edit-outline: 2px solid hsl(var(--main-subtle));
    --jse-selection-background-color: hsl(var(--main-highlight-med));
    --jse-background-color: hsl(var(--main-bg));
    --jse-main-border: 1px solid hsl(var(--main-highlight-high));
    --jse-panel-color: hsl(var(--main-fg));
    --jse-panel-background: hsl(var(--main-overlay));
    --jse-panel-color-readonly: hsl(var(--main-subtle));
    --jse-search-match-background-color: hsl(var(--main-foam), 0.5);
    --jse-message-error-background: hsl(var(--main-rose));
    --jse-message-error-color: hsl(var(--main-bg));
    --jse-font-family: Roboto;
    --jse-font-family-mono: Roboto;
    width: 100%;
    height: 100%;
    position: absolute;
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
