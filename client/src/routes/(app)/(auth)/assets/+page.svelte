<script lang="ts">
  import { type AssetResponse, hasAudioFileExtension, hasImgFileExtension } from '@backend/models/Asset';
  import { updateAsset, deleteAsset } from '../../../../utils/api';
  import Popup from '../../../../components/ui/Popup.svelte';
  import FileDrop from '../../../../components/ui/FileDrop.svelte';
  import Accordion from '../../../../components/ui/Accordion.svelte';
  import { Delete, Edit, Plus, Save, Trash2, X } from 'lucide-svelte';
  import { writable, type Writable } from 'svelte/store';
  import Spinner from '../../../../components/ui/Spinner.svelte';
  import AudioPlayer from '../../../../components/ui/AudioPlayer.svelte';
  import Asyncable from '../../../../components/ui/Asyncable.svelte';
  import { flip } from 'svelte/animate';

  export let data: { assets: AssetResponse[] };
  let updateAssetPromise: Promise<AssetResponse | null> | undefined;
  let errorMsg: Writable<string | undefined> = writable();
  let deleteAssetPromise: Promise<AssetResponse | null> | undefined;
  let assets: Writable<AssetResponse[]> = writable(data.assets);
  let newAssetFileName: Writable<string | undefined> = writable();
  let originalAsset: Writable<AssetResponse | undefined> = writable();

  $: loading = $assets === undefined || deleteAssetPromise !== undefined;

  let file: File | undefined;
  let show: boolean;

  $: dirty =
    ($newAssetFileName && !$originalAsset) || ($originalAsset && $originalAsset.name !== $newAssetFileName) || !!file;

  // when get Assets is active, cancel the update asset action otherwise it will cause an infinite loop

  function uploadFile(files: File[]) {
    file = files[0];
  }

  function clearFile() {
    file = undefined;
  }

  async function saveAsset() {
    updateAssetPromise = updateAsset($originalAsset?.id, $newAssetFileName, file);
    $errorMsg = undefined;
  }

  function onClose() {
    file = undefined;
    newAssetFileName.set(undefined);
    originalAsset.set(undefined);
  }

  async function closePopup() {
    show = false;
  }

  function handleNewAsset() {
    $newAssetFileName = '';
    show = true;
  }

  function onAssetNameChange(e: Event & { currentTarget: HTMLInputElement }) {
    $newAssetFileName = e.currentTarget.value;
  }

  function onAssetUpdate(event: { detail: { data: AssetResponse | null } }) {
    show = false;
    const newAsset = event.detail.data;
    if (newAsset) {
      assets.update((current) => {
        if (!current) return current;
        const i = current.findIndex((val) => val.id === newAsset.id);
        if (i >= 0) {
          current[i] = newAsset;
          return current;
        }
        return [...current, newAsset];
      });
    }
    updateAssetPromise = undefined;
  }

  function onAssetUpdateError(e: CustomEvent<{ error: Error }>) {
    $errorMsg = e.detail.error.message;
    updateAssetPromise = undefined;
  }

  function handleAssetDelete(asset: AssetResponse) {
    deleteAssetPromise = deleteAsset(asset.id);
    deleteAssetPromise
      .then((val) => onAssetDelete(val))
      .catch(() => {
        deleteAssetPromise = undefined;
      });
  }

  function onAssetDelete(data: AssetResponse | null) {
    if (data) {
      assets.update((current) => {
        if (!current) return current;
        const i = current.findIndex((val) => val.id === data.id);
        current.splice(i, 1);
        return current;
      });
    }
    deleteAssetPromise = undefined;
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
      <button on:click={handleNewAsset} class="button-round">
        <Plus />
      </button>
    </div>

    {#if $assets !== undefined}
      <Popup {onClose} style={`width:50%;`} bind:show>
        <Asyncable on:load={onAssetUpdate} on:error={onAssetUpdateError} promise={updateAssetPromise}>
          <div id="popup-wrapper">
            <input
              placeholder={file?.name ?? ''}
              class="popup-input static-padding"
              type="text"
              style="font-size: 20px;"
              value={$newAssetFileName}
              on:input={onAssetNameChange}
            />
            {#if $originalAsset}
              <div>
                Current file: <a href="#">{$originalAsset?.fileName}</a>
              </div>
            {/if}
            {#if file}
              <div id="selected-file">
                <span>New file: {file.name}</span>
                <button style="color: hsl(var(--main-love)); align-items: center;" on:click|stopPropagation={clearFile}
                  ><Delete /></button
                >
              </div>
            {:else}
              <FileDrop onFileChange={uploadFile} />
            {/if}
            <div id="popup-buttons" class="row">
              <button class="button-round" on:click={closePopup}><X /></button>
              <button disabled={!dirty} class="button-round" on:click={saveAsset}><Save /></button>
              {#if $errorMsg}
                <div class="error">{$errorMsg}</div>
              {/if}
            </div>
          </div>
        </Asyncable>
      </Popup>
      {#each $assets as asset (asset)}
        <div animate:flip>
          <Accordion>
            <div class="content" slot="toggle-button">
              <span>{asset.name}</span>
              <div>
                <button
                  class="button"
                  on:click|stopPropagation={() => {
                    show = true;
                    originalAsset.set(asset);
                    newAssetFileName.set(asset.name);
                  }}><Edit /></button
                >
                <button class="button" on:click|stopPropagation={() => handleAssetDelete(asset)}><Trash2 /></button>
              </div>
            </div>
            <div slot="toggle-content">
              <div>{asset.fileName}</div>
              {#if hasAudioFileExtension(asset.path)}
                <AudioPlayer src={asset.path} html5 />
              {:else if hasImgFileExtension(asset.path)}
                <img src={asset.path} alt={asset.path} />
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
    overflow: auto;
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

  .error {
    color: hsl(var(--main-love));
  }

  .button-round {
    padding: 0;
    margin: 2px;
    width: 44px;
    height: 44px;
  }

  #selected-file {
    display: flex;
    justify-content: space-between;
  }

  #popup-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  #popup-buttons {
    gap: 0 10px;
    align-items: center;
  }

  .popup-input {
    width: 100%;
    text-align: center;
  }
</style>
