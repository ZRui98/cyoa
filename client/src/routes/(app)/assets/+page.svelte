<script lang="ts">
    import { type AssetResponse, hasAudioFileExtension, hasImgFileExtension } from "@backend/Asset";
    import { getAssets, updateAsset } from "../../../utils/api";
    import { onMount } from "svelte";
    import Popup from "../../../components/ui/Popup.svelte";
    import FileDrop from "../../../components/ui/FileDrop.svelte";
    import Accordion from "../../../components/ui/Accordion.svelte";
    import { Delete, Edit, Plus, Save, Trash2, X } from "lucide-svelte";
    import { writable, type Writable } from "svelte/store";
    import Spinner from "../../../components/ui/Spinner.svelte";
    import AudioPlayer from "../../../components/ui/AudioPlayer.svelte";
    import Asyncable from "../../../components/ui/Asyncable.svelte";

    let getAssetsPromise: Promise<AssetResponse[]> = Promise.resolve([]);
    let updateAssetPromise: Promise<void> | undefined;
    let newAssetFileName: Writable<string | undefined> = writable();
    let originalAsset: Writable<AssetResponse | undefined> = writable();
    onMount(() => {
        getAssetsPromise = getAssets();
    });

    // when get Assets is active, cancel the update asset action otherwise it will cause an infinite loop
    $: {
        if (getAssetsPromise !== undefined) {
            updateAssetPromise = undefined;
        }
    }
    let file: File | undefined;
    let show: boolean;
    $: dirty = (($newAssetFileName && !$originalAsset) || $originalAsset && $originalAsset.name !== $newAssetFileName) || !!file;
    function uploadFile(files: File[]) {
        file = files[0];
    }

    function clearFile() {
        file = undefined;
    }

    async function saveAsset() {
        console.log('saving asset', $originalAsset, $newAssetFileName)
        updateAssetPromise = updateAsset($originalAsset?.id, $newAssetFileName, file);
    }

    function onClose() {
        console.log(file?.name);
        file = undefined;
        newAssetFileName.set(undefined);
        originalAsset.set(undefined);
    }

    async function closePopup() {
        show = false;
    }

    function onAssetNameChange(e: Event & { currentTarget: HTMLInputElement}) {
        console.log('asset name change', e.currentTarget.value)
        $newAssetFileName = e.currentTarget.value;
    }

    function onAssetUpdate(event: {detail: {data: void}}) {
        show = false;
        console.log("loaded!");
        alert();
        getAssetsPromise = getAssets();
    }

    function handleNewAsset() {
        $newAssetFileName = '';
        show = true;
    }
</script>

<div id="title" class="row">
    <span>assets</span>
    <button on:click={handleNewAsset} class="button-round">
        <Plus/>
    </button>
</div>

{#await getAssetsPromise}
    <Spinner/>
{:then assets}
    <Popup onClose={onClose} style={`width:50%;`} bind:show={show}>
        <Asyncable on:load={onAssetUpdate} on:error={(e) => console.log("error", e)} promise={updateAssetPromise}>
            <div id="popup-wrapper">
                <input placeholder={file?.name ?? ''} class="popup-input static-padding" type="text" style="font-size: 20px;" value={$newAssetFileName} on:input={onAssetNameChange}/>
                {#if $originalAsset}
                <div>Current file: <a href=#>{$originalAsset?.fileName}</a></div>
                {/if}
                {#if file}
                    <div id="selected-file">
                        <span>New file: {file.name}</span>
                        <button style="color: var(--main-love); align-items: center;" on:click|stopPropagation={clearFile}><Delete/></button>
                    </div>
                {:else}
                    <FileDrop onFileChange={uploadFile}/>
                {/if}
                <div id="popup-buttons" class="row">
                    <button class="button-round" on:click={closePopup}><X/></button>
                    <button disabled={!dirty} class="button-round" on:click={saveAsset}><Save/></button>
                </div>
            </div>
        </Asyncable>
    </Popup>
    {#each assets as asset, i}
    <Accordion>
        <div class="content" slot="toggle-button">
            <span>{asset.name}</span> 
            <div>
                <button class="button" on:click|stopPropagation={() => {show = true; originalAsset.set(asset); newAssetFileName.set(asset.name)}}><Edit/></button>
                <button class="button" on:click|stopPropagation={() => {show = false; originalAsset.set(undefined); newAssetFileName.set(undefined)}}><Trash2/></button>
            </div>
        </div>
        <div slot="toggle-content">
            <div>{asset.fileName}</div>
            {#if hasAudioFileExtension(asset.path)}
            <AudioPlayer src={asset.path} html5/>
            {:else if hasImgFileExtension(asset.path)}
                <img src={asset.path} alt={asset.path} />
            {/if}
        </div>
    </Accordion>
    {/each}
{/await}

<style>
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
        padding: 10px;
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
    }

    .popup-input {
        width: 100%;
        text-align: center;
    }
</style>
