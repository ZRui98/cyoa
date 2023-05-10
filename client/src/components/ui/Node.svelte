<script lang="ts">
    import type { Edge } from "@backend/Node";
    import { isAudioExportableResource, isTextResource, type ExportableResource, type TextResource, type Resource, isImgExportableResource } from "@backend/Resource";
    import { adventureStore, currentActiveNode } from "../../store/adventure";
    import AudioPlayer from "./AudioPlayer.svelte";

    const { getNodeById } = adventureStore;
    let nodeResources: Resource[] = [];
    let options: Edge[] = [];
    $: {
        if ($currentActiveNode) {
            nodeResources = [];
            options = [];
            const node = getNodeById($currentActiveNode);
            if (node) {
                const {links, resources} = node;
                nodeResources = resources;
                options = links;
            }
        }
    }
</script>

<div>
    {#each nodeResources as resource}
        <div class="resource">
            {#if isTextResource(resource)}
                <div id="node-content">
                    <span>{resource.content}</span>
                </div>
            {:else if isAudioExportableResource(resource)}
                <AudioPlayer src={resource.path} autoplay html5/>
            {:else if isImgExportableResource(resource)}
                <img src={resource.path} alt={resource.path} />
            {/if}
        </div>
    {/each}
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

<style>
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

    .resource {
        padding-top: 25px;
        padding-bottom: 25px;
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
</style>