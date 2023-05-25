<script lang="ts">
    import GraphOverview from "../../../../../components/ui/GraphOverview.svelte";
    import Sidebar from "../../../../../components/ui/Sidebar.svelte";
    import { onMount } from "svelte";
    import { adventureStore, currentActiveNode } from "../../../../../store/adventure";
    import { getContext, onDestroy } from "svelte";
    import type { Writable } from "svelte/store";
    import Node from "../../../../../components/ui/Node.svelte";
    let open = false;
    let promise: Promise<any>;
    const { getNodeById } = adventureStore;

    $: adventureName = $adventureStore?.name ?? ""

    const layoutStyling = getContext<Writable<string>>('layoutStyling');
    const STATIC_STYLE = 'transition: 0.3s ease-in-out;'
    $: {
        layoutStyling.set(open ? `margin: 0 5%;margin-right: 55%;${STATIC_STYLE}` : STATIC_STYLE);
    }

    onMount(async () => {
        promise = adventureStore.setAdventure("", "");
        await promise;
        const node: string = window.location.hash.substring(1);
        if (getNodeById(node)) {
            currentActiveNode.set(node);
        }
    });

    onDestroy(() => {
        layoutStyling.set("");
    })
</script>

<svelte:head>
    <title>{adventureName}</title> 
</svelte:head>
<div id="adventure" class:open>
    {#await promise}
        <span>Loading...</span>
    {:then}
        <Node />
    {/await}
</div>
<Sidebar bind:open>
    <GraphOverview/>
</Sidebar>

<style>
    #adventure {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        transition: 0.3s ease-in-out;
        justify-content: center;
        height: 100%;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
    }

    span {
        font-size: 20;
    }
</style>