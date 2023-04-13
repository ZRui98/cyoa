<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { NodeGraphics } from "./pixi/NodeGraphics";
  import { PixiApplication } from "./pixi/PixiApplication";
  import { PixiZoomPanContainer } from "./pixi/PixiZoomPanContainer";
  import type { IApplicationOptions } from "pixi.js";
  import {adventureStore } from "../store/adventure";
  const pixi = new PixiApplication();
  let zoomContainer: PixiZoomPanContainer;
  let div: HTMLElement;

  onMount(async () => {
    pixi.init({
        resizeTo: div,
        backgroundColor: "#191724",
    } as IApplicationOptions);
    pixi.application.stage.eventMode = 'static';
    zoomContainer = new PixiZoomPanContainer(div);
    pixi.application.stage.addChild(zoomContainer);
    div.appendChild(pixi.application.view as unknown as Node);

    adventureStore.subscribe((adventure) => {
      if (adventure) {
        zoomContainer.removeChildren();
        zoomContainer.addChild(new NodeGraphics("1", adventure.nodes["1"], 250, 0))
      }
    });
  })

  onDestroy(() => {
    zoomContainer.removeAllListeners();
  })

</script>
<div bind:this={div} />

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>