<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { isFileAsset, isManagedExportableAsset, isTextAsset, type Asset, AssetType } from '@backend/models/Asset';
  import JsonView from '../../../../components/ui/JsonView.svelte';
  import Accordion from '../../../../components/ui/Accordion.svelte';
  import Tab from '../../../../components/ui/Tab.svelte';
  import Tabs from '../../../../components/ui/Tabs.svelte';
  import GraphOverview from '../../../../components/ui/GraphOverview.svelte';
  import { adventureStore } from '../../../../store/adventure';
  import Node from '../../../../components/ui/Node.svelte';
  import loginState from '../../../../store/loginState';
  import Sidebar from '../../../../components/ui/Sidebar.svelte';

  adventureStore.initializeAdventure();

  const layoutStyling = getContext<Writable<string>>('layoutStyling');
  const STATIC_STYLE = 'transition: 0.3s ease-in-out;';
  let open = true;
  $: {
    layoutStyling.set(open ? `margin: 0 5%;margin-right: 55%;${STATIC_STYLE}` : STATIC_STYLE);
  }

  $: assetTypes = $loginState?.activated ? Object.keys(AssetType) : [AssetType.EXPORTED, AssetType.TEXT];

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
      assets: []
    };
  }

  function createNewAsset(type: string): Asset {
    switch(type) {
      case 'MANAGED':
        return {};
      case 'FILE':
        return {path: 'https://example.com/audio.mp3'};
      case 'TEXT':
        return {content: 'Sample Text Content'};
    }
    return {}
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

  function addNewEdge(nodeKey: string) {
    const edges = getPossibleEdgesForNode(nodeKey);
    const edgeKeys = Object.keys(edges)
    if (edgeKeys.length > 0)
      adventureStore.addEdge(nodeKey, { prompt: '', next: edgeKeys[0] });
    // if (!$adventureStore?.nodes[nodeKey]) return;
    // if (!$adventureStore.nodes[nodeKey].links) $adventureStore.nodes[nodeKey].links = [];
    // $adventureStore.nodes[nodeKey].links.push({prompt: "", next: "0"});
  }

  function getPossibleEdgesForNode(nodeKey: string): { [key: string]: string } {
    if (!$adventureStore) return {};
    return Object.keys($adventureStore.nodes)
      .filter((val) => val !== nodeKey)
      .reduce((acc: { [key: string]: string }, curr) => {
        if (!$adventureStore) return acc;
        acc[curr] = $adventureStore.nodes[curr].name;
        return acc;
      }, {});
  }

  // let content = {
  //   json: adventure
  // } as unknown as Content;
</script>

{#if $adventureStore}
  <div class="json-preview">
    <div>
      <span>Title: </span><input bind:value={$adventureStore.name} class="static-padding" type="text" />
    </div>
    <Tabs style="flex: 1 1 auto;">
      <Tab index="0" title="Nodes">
        <button class="button-round" on:click={addNewNode}>
          <Plus />
        </button>
        {#each Object.keys($adventureStore.nodes) as nodeKey}
          <Accordion>
            <div slot="toggle-button">
              {$adventureStore.nodes[nodeKey].name}
            </div>
            <div slot="toggle-content">
              <input bind:value={$adventureStore.nodes[nodeKey].name} class="static-padding" type="text" />
              <div>
                <h2>
                  Content
                  <button class="button-round" on:click={() => adventureStore.addAsset(nodeKey, {content: 'Sample Text Content'})}>
                    <Plus />
                  </button>
                  <div class="content">
                    {#each ($adventureStore).nodes[nodeKey].assets as asset, i}
                      <div>
                        <select value={getAssetType(asset)} on:change={(e) => adventureStore.updateAsset(nodeKey, createNewAsset(e.currentTarget.value), i)}>
                          {#each assetTypes as option}
                          <option value={option}>{option}</option>
                          {/each}
                        </select>
                        {#if isTextAsset(asset)}
                          <input type="text" bind:value={asset.content}/>
                        {:else if isManagedExportableAsset(asset)}
                        <div>
                          Asset Preview
                        </div>
                        {:else if isFileAsset(asset)}
                          <input type="text" bind:value={asset.path} />
                        {/if}
                      </div>
                    {/each}
                  </div>
                </h2>
              </div>
              <div>
                <h2>
                  Goes To
                  <button class="button-round" on:click={() => addNewEdge(nodeKey)}>
                    <Plus />
                  </button>
                  <div class="links">
                    {#each $adventureStore.nodes[nodeKey].links || [] as link}
                      <div>
                        <input type="text" bind:value={link.prompt} />
                        <select bind:value={link.next}>
                          {#each Object.entries(getPossibleEdgesForNode(nodeKey)) as [edgeId, edgeLabel]}
                            <option value={edgeId}>{edgeLabel}</option>
                          {/each}
                        </select>
                      </div>
                    {/each}
                  </div>
                </h2>
              </div>
            </div>
          </Accordion>
        {/each}
      </Tab>
      <Tab index="1" title="Edges">content 2</Tab>
      <Tab index="2" title="JSON">
        <JsonView json={$adventureStore} />
      </Tab>
      <Tab index="3" title="Preview">
        <Node />
      </Tab>
    </Tabs>

    <div id="preview">
      <div>
      </div>
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

  .links {
    flex-direction: column;
    display: flex;
  }
</style>
