<script lang="ts">
  import type { Edge } from "@backend/Node";
  import { isTextResource } from "@backend/Resource";
  import { adventureStore, currentActiveNode } from "../../store/adventure";

  const { getNodeById } = adventureStore;
  let nodeText: string | undefined;
  let options: Edge[] = [];
  $: {
    if ($currentActiveNode) {
      const {name, links, resources} = getNodeById($currentActiveNode);
      for (const resource of resources) {
        if (isTextResource(resource)) {
          nodeText = resource?.content;
        }
      }
      options = links || [];
    }
  }
</script>

<div id="node-wrapper">
  <span>{nodeText}</span>
  <footer>
    <div class="options">
    {#each options as option}
      <a href="#" class="option">{option.prompt}</a>
    {/each}
    </div>
  </footer>
</div>

<style>
  .options {
    align-items: center;
    flex-direction: column;
    display: flex;
  }
  a {
    text-decoration: none;
    color: var(--main-love);
  }

  a:active {
    text-decoration: underline;
  }

  a:hover {
    color: var(--main-gold);
  }

  a::before {
    visibility: hidden;
    content: "\002666";
    display: inline-block;
    align-content: left;
    text-decoration: none;
  }

  a:hover::before {
    visibility: visible;
  }

  footer {
    display: block;
  }

  span {
    font-size: 20;
  }

  #node-wrapper {
    height:100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin: 50px 0;
  }
</style>