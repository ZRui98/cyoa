<script lang="ts">
  import { type ManagedAssetResponse, FileType } from '@backend/models/Asset';
  import { deleteAsset } from '../../../../utils/api';
  import Accordion from '../../../../components/ui/Accordion.svelte';
  import { Edit, Plus, Trash2 } from 'lucide-svelte';
  import { writable, type Writable } from 'svelte/store';
  import Spinner from '../../../../components/ui/Spinner.svelte';
  import AudioPlayer from '../../../../components/ui/AudioPlayer.svelte';
  import { flip } from 'svelte/animate';
  import { toast } from 'svelte-sonner';
  import AssetUpdatePopup from '../../../../components/ui/menu/AssetUpdatePopup.svelte';

  export let data: { assets: ManagedAssetResponse[] };
  let deleteAssetPromise: Promise<ManagedAssetResponse | null> | undefined;
  let assets: Writable<ManagedAssetResponse[]> = writable(data.assets);

  let showAssetPopup = false;
  let editingAsset: ManagedAssetResponse | undefined;

  $: loading = $assets === undefined || deleteAssetPromise !== undefined;

  function handleAssetDelete(asset: ManagedAssetResponse) {
    deleteAssetPromise = deleteAsset(asset.name);
    deleteAssetPromise
      .then((data) => {
        if (data) {
          assets.update((current) => {
            if (!current) return current;
            const i = current.findIndex((val) => val.name === data.name);
            current.splice(i, 1);
            return current;
          });
        }
        deleteAssetPromise = undefined;
      })
      .catch(() => {
        deleteAssetPromise = undefined;
    });
    toast.promise(deleteAssetPromise, {
      duration: 1500,
      error: `Failed to delete asset ${asset.name}`,
      loading: `Deleting asset ${asset.name}...`,
      success: `Deleted asset ${asset.name}`,
      info: '',
      warning: '',
    });
  }

  function handleCreateAsset() {
    editingAsset = undefined;
    showAssetPopup = true;
  }

  function handleEditAsset(asset: ManagedAssetResponse) {
    console.log('editing', asset)
    editingAsset = asset;
    showAssetPopup = true;
  }

  function onAssetSave(event: CustomEvent<{ oldAsset: ManagedAssetResponse | null, asset: ManagedAssetResponse }>) {
    const idx = $assets.findIndex(asset => asset.name === event.detail.oldAsset?.name);
    if (idx < 0) {
      $assets = [...$assets, event.detail.asset];
    } else {
      $assets[idx] = event.detail.asset;
    }
  }
</script>

<div id="wrapper">
  {#if loading}
    <div class="container" id="overlay">
      <Spinner />
    </div>
  {/if}
  <div class="container">
    <div id="title" class="row">
      <span>assets</span>
      <button on:click={handleCreateAsset} class="button-round">
        <Plus display="block" />
      </button>
    </div>

    {#if $assets !== undefined}
      <AssetUpdatePopup asset={editingAsset} bind:show={showAssetPopup} on:update={onAssetSave}/>
      {#each $assets as asset (asset)}
        <div>
          <Accordion>
            <div class="content" slot="toggle-button">
              <span>{asset.name}</span>
              <div>
                <button
                  class="button"
                  on:click|stopPropagation={() => handleEditAsset(asset)}><Edit display="block" /></button
                >
                <button class="button" on:click|stopPropagation={() => handleAssetDelete(asset)}><Trash2 display="block" /></button>
              </div>
            </div>
            <div slot="toggle-content">
              <div>{asset.fileName}</div>
              {#if asset.path}
                {#if asset.fileType === FileType.AUDIO}
                  <AudioPlayer src={asset.path} html5 />
                {:else if asset.fileType === FileType.IMG}
                  <img src={asset.path} alt={asset.path} />
                {/if}
              {/if}
            </div>
          </Accordion>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  #wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  #overlay {
    z-index: 1;
  }

  .container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  #title {
    font-size: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  #title .button-round {
    align-self: center;
  }

  .content {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }

  .button-round {
    padding: 0;
    margin: 2px;
    width: 44px;
    height: 44px;
  }

  img {
    max-width: 100%;
  }
</style>
