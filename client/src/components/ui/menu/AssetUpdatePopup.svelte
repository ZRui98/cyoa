<script lang="ts">
  import { Delete, Save, X } from 'lucide-svelte';
  import { writable, type Writable } from 'svelte/store';
  import type { ManagedAssetResponse } from '@backend/models/Asset';
  import Popup from '../components/Popup.svelte';
  import { updateAsset } from '../../../utils/api';
  import FileDrop from '../media/FileDrop.svelte';
  import { createEventDispatcher } from 'svelte';
  import { toast } from 'svelte-sonner';

  export let show: boolean;
  export let asset: ManagedAssetResponse | null = null;

  let file: File | undefined = undefined;
  let newAssetName: Writable<string | undefined> = writable('');
  let updateAssetPromise: Promise<void> | undefined;
  const dispatch = createEventDispatcher();

  $: {
    $newAssetName = asset?.name;
  }
  $: dirty = (asset && asset.name !== $newAssetName) || !!file;
  function uploadFile(files: File[]) {
    file = files[0];
  }

  function clearFile() {
    file = undefined;
  }

  async function saveAsset() {
    updateAssetPromise = updateAsset(asset?.id, $newAssetName, file)
      .then((updatedAsset) => {
        dispatch('update', { oldAsset: JSON.parse(JSON.stringify(asset)), asset: updatedAsset });
        asset = null;
        show = false;
        clearFile();
      })
      .catch((e) => {
        dispatch('error', { error: e });
        throw e;
      });
    toast.promise(updateAssetPromise, {
      success: 'Successfully saved asset',
      error: 'Failed to save asset',
      loading: 'Saving asset...',
      info: '',
      warning: '',
    });
  }

  function onClose() {
    clearFile()
    newAssetName.set(undefined);
  }

  async function closePopup() {
    show = false;
  }
</script>

<Popup on:close={onClose} style={`width:32em;`} bind:show>
  <div id="popup-wrapper">
    <input
      placeholder={file?.name ?? ''}
      class="popup-input static-padding"
      type="text"
      style="font-size: 20px;"
      bind:value={$newAssetName}
    />
    {#if asset}
      <div>
        Current file: <a href={asset.path}>{asset.fileName}</a>
      </div>
    {/if}
    {#if file}
      <div id="selected-file">
        <span>New file: {file.name}</span>
        <button style="color: hsl(var(--main-love)); align-items: center;" on:click|stopPropagation={clearFile}
          ><Delete display="block" /></button
        >
      </div>
    {:else}
      <FileDrop onFileChange={uploadFile} />
    {/if}
    <div id="popup-buttons" class="row">
      <button class="button-round" on:click={closePopup}><X display="block" /></button>
      <button disabled={!dirty} class="button-round" on:click={saveAsset}><Save display="block" /></button>
    </div>
  </div>
</Popup>

<style>
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
