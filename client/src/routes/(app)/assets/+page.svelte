<script lang="ts">
    import type { AssetMetaData } from "@backend/Asset";
    import { getAssets } from "../../../utils/api";
    import { onMount } from "svelte";
    import Popup from "../../../components/ui/Popup.svelte";
    import FileDrop from "../../../components/ui/FileDrop.svelte";
    import Accordion from "../../../components/ui/Accordion.svelte";
    import { Save, Trash2 } from "lucide-svelte";
    import { writable, type Writable } from "svelte/store";

    let promise: Promise<AssetMetaData[]> = Promise.resolve([]);//Promise.resolve(v);
    let popupAsset: Writable<AssetMetaData | undefined> = writable();
    onMount(() => {
        promise = getAssets();
    });
    let file: File | undefined;
    let show: boolean;
    let dirty: boolean = false;
    let assetIdx: number | undefined;
    function onDrop(files: File[]) {
        file = files[0];
        dirty = true;
    }

    async function saveAsset() {
        console.log(file?.name);
        file = undefined;
        dirty = false;
        popupAsset.set(undefined);
        show = false;
    }

    async function deleteAsset() {
        console.log(file?.name);
        file = undefined;
        dirty = false;
        popupAsset.set(undefined);
        show = false;
    }

    function onAssetNameChange(e: Event & { currentTarget: HTMLInputElement}) {
        if ($popupAsset) {
            popupAsset.update((asset) => {
                if (!asset) return asset;
                return {
                    ...asset,
                    name: e.currentTarget.value,
                }
            });
        }
    }
</script>

<h2>assets</h2>
{#await promise}
    loading...
{:then assets}
    <Popup style={`width:50%; flex-direction: column`} bind:show={show}>
        <input class="popup-input static-padding" type="text" style="font-size: 20px;" value={$popupAsset?.name} on:change={onAssetNameChange}/>
        <div>Current file: <a href=#>{assetIdx !== undefined ? assets[assetIdx].fileName : assetIdx}</a></div>
        {#if file}
            <div>New file: {file.name}<button class="popup-button" on:click|stopPropagation={() => file = undefined}><Trash2/></button></div>
        {:else}
            <FileDrop style={`padding-bottom: 10px;`} onFileChange={onDrop}/>
        {/if}
        <div>
            <button class="popup-button" on:click={saveAsset}><Trash2/></button>
            <!-- svelte-ignore a11y-autofocus -->
            <button autofocus class="popup-button" on:click={deleteAsset}><Save/></button>
        </div>
    </Popup>
    {#each assets as asset, i}
    <Accordion>
        <div class="content" slot="toggle-button">
            <span>{asset.name}</span> 
            <div>
                <button class="link-button" on:click|stopPropagation={() => {show = true; assetIdx = i; popupAsset.set(asset)}}>Edit</button>
            </div>
        </div>
        <div slot="toggle-content">{asset.fileName}</div>
    </Accordion>
    {/each}
{/await}

<style>
    .content {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .popup-button {
        color: var(--main-love);
    }

    .popup-input {
        width: 100%;
        text-align: center;
    }

    .link-button {
        color: var(--main-love);
        text-decoration: underline;
    }
</style>
