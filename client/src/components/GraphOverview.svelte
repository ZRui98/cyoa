<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { NodeGraphics } from "./pixi/NodeGraphics";
  import { PixiApplication } from "./pixi/PixiApplication";
  import { PixiZoomPanContainer } from "./pixi/PixiZoomPanContainer";
  const pixi = new PixiApplication();
  let zoomContainer: PixiZoomPanContainer;
  let div: HTMLElement;
  onMount(() => {
    pixi.init({
        resizeTo: div,
        backgroundColor: "#191724",
    });
    pixi.application.stage.eventMode = 'static';
    zoomContainer = new PixiZoomPanContainer(div);
    pixi.application.stage.addChild(zoomContainer);
    zoomContainer.addChild(new NodeGraphics({id: "", resources: [], forward: null}));
    zoomContainer.addChild(new NodeGraphics({id: "", resources: [], forward: null}, 250, 250));
    div.appendChild(pixi.application.view as unknown as Node);
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