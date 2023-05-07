<script lang="ts">
    import GraphOverview from "../../../../../components/ui/GraphOverview.svelte";
    import Sidebar from "../../../../../components/ui/Sidebar.svelte";
    import { onMount } from "svelte";
    import { adventureStore, currentActiveNode } from "../../../../../store/adventure";
    import type { Edge } from "@backend/Node";
    import { isTextResource } from "@backend/Resource";
    import { getContext, onDestroy } from "svelte";
    import type { Writable } from "svelte/store";
    let open = false;
    let promise: Promise<any>;
    const { getNodeById } = adventureStore;

    let nodeText: string | undefined;
    let options: Edge[] = [];
    $: adventureName = $adventureStore?.name ?? ""
    $: {
        if ($currentActiveNode) {
            const node = getNodeById($currentActiveNode);
            if (node) {
                const {links, resources} = node;
                for (const resource of resources) {
                    if (isTextResource(resource)) {
                        nodeText = resource?.content;
                    }
                }
                options = links || [];
            }
        }
    }

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
        <div id="node-content">
            <span>{nodeText}</span>
        </div>
        <div id="choices">
            <div class="options">
                {#each options as option}
                    <button on:click={() => {
                            currentActiveNode.set(option.next)}
                        }
                        class="option">
                        {option.prompt}
                    </button>
                {/each}
            </div>
        </div>
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
    
    #node-content {
        flex-grow: 1;
    }

    #choices {
        display: block;
        margin-bottom: 30px;
    }

    .options {
        align-items: center;
        flex-direction: column;
        display: flex;
    }

    button.option {
        text-decoration: none;
        color: var(--main-love);
    }

    button.option:active {
        text-decoration: underline;
    }

    button.option:hover {
        color: var(--main-gold);
    }

    button.option::before {
        visibility: hidden;
        content: "\002666";
        display: inline-block;
        align-content: left;
        text-decoration: none;
    }

    button.option:hover::before {
        visibility: visible;
    }

    span {
        font-size: 20;
    }
</style>
