<script lang="ts">
    import type { AssetMetaData } from "@backend/Asset";
    import { getAssets } from "../../../utils/api";
    import { onMount } from "svelte";
    import Popup from "../../../components/ui/Popup.svelte";

    let v: AssetMetaData[] = [{name: 'asset 1', fileName: 'asset1.jpg', author: 'user1'},{name: 'asset 2', fileName: 'asset1.jpg', author: 'user1'},{name: 'asset 2', fileName: 'asset1.jpg', author: 'user1'}];
    let promise: Promise<AssetMetaData[]> = Promise.resolve([]);//Promise.resolve(v);
    let popupAsset: AssetMetaData | undefined;
    onMount(() => {
        promise = getAssets();
    })
</script>

<h2>assets</h2>
{#await promise}
    loading...
{:then assets}
    <Popup show={popupAsset !== undefined}>
        <h2>{popupAsset?.name}</h2>
    </Popup>
    {#each assets as asset}
    <div class="card">
        {asset.name} <button on:click={() => popupAsset = asset}>Edit</button>
    </div>
    {/each}
{/await}

<style>
    .card {
        display: flex;
        justify-content: space-between;
    }
</style>
