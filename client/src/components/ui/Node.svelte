<script lang="ts">
  import type { Edge } from '@backend/models/Node';
  import {
    isAudioExportableAsset,
    isTextAsset,
    type Asset,
    isImgExportableAsset,
    isManagedExportableAsset,
    type ManagedExportableAsset,
  } from '@backend/models/Asset';
  import { adventureStore, currentActiveNode } from '../../store/adventure';
  import AudioPlayer from './AudioPlayer.svelte';
  import { getAssetsByName } from '../../utils/api';
  let nodeAssets: Promise<Asset[]> = Promise.resolve([]);
  let options: Edge[] = [];

  async function getNodeAssets(assets: Asset[]): Promise<Asset[]> {
    const nonManagedAssets: Asset[] = assets.filter((asset) => !isManagedExportableAsset(asset));
    const managedAssets: ManagedExportableAsset[] = assets.filter(isManagedExportableAsset);
    if (managedAssets.length == 0) {
      return nonManagedAssets;
    }
    const managedAssetIds = managedAssets.map((asset) => asset.managedAssetId);
    const resolvedManagedAssets = await getAssetsByName($adventureStore!.author, managedAssetIds);
    return [...nonManagedAssets, ...resolvedManagedAssets];
  }
  $: {
    if ($currentActiveNode) {
      nodeAssets = Promise.resolve([]);
      options = [];
      const node = adventureStore.getNodeById($currentActiveNode?.id);
      if (node) {
        const { links, assets } = node;
        if (assets) {
          nodeAssets = getNodeAssets(assets).then((v) => {
            return v;
          });
        }
        options = links || [];
      }
    }
  }
</script>

<div id="adventure-node" {...$$restProps}>
  <div class="node-content">
    {#await nodeAssets then assets}
      {#each assets as asset}
        <div class="resource">
          {#if isTextAsset(asset)}
            <pre>{asset.content}</pre>
          {:else if isAudioExportableAsset(asset)}
            <AudioPlayer src={asset.path} autoplay html5 />
          {:else if isImgExportableAsset(asset)}
            <img src={asset.path} alt={asset.path} />
          {/if}
        </div>
      {/each}
    {/await}
  </div>
  <div id="choices">
    <div class="options">
      {#each options as option}
        <button
          on:click={() => {
            currentActiveNode.set(option.next);
          }}
          class="option"
        >
          {option.prompt}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  #adventure-node {
    flex: 1;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
  }

  .node-content {
    padding: 10px 25px;
  }

  #choices {
    display: block;
    border-top: 2px solid hsl(var(--main-highlight-high));
    padding-top: 25px;
    padding-bottom: 30px;
  }

  .options {
    align-items: center;
    flex-direction: column;
    display: flex;
    gap: 3px;
  }

  .resource {
    padding-top: 25px;
    padding-bottom: 25px;
  }

  button.option {
    text-decoration: none;
    color: hsl(var(--main-love));
  }

  button.option:active {
    text-decoration: underline;
  }

  button.option:hover {
    color: hsl(var(--main-gold));
  }

  button.option::before {
    visibility: hidden;
    content: '\002666';
    display: inline-block;
    align-content: left;
    text-decoration: none;
  }

  button.option:hover::before {
    visibility: visible;
  }

  img {
    max-width: 100%;
  }
</style>
