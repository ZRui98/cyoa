<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { NodeGraphics } from "../pixi/NodeGraphics";
  import { PixiApplication } from "../pixi/PixiApplication";
  import { PixiZoomPanContainer } from "../pixi/PixiZoomPanContainer";
  import type { IApplicationOptions } from "pixi.js";
  import {adventureStore } from "../../store/adventure";
  import { getWidthAndHeight, processLayersToCoords } from "../../utils/createGraph";
  const pixi = new PixiApplication();
  let zoomContainer: PixiZoomPanContainer;
  let div: HTMLElement;

  onMount(() => {
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
        const graph = adventure.nodes;
        const graphMap = getWidthAndHeight(adventure.start, graph);
        const graphCoOrds = processLayersToCoords(graphMap);
        zoomContainer.removeChildren();
        for (const coord of graphCoOrds) {
          zoomContainer.addChild(new NodeGraphics(coord.i, adventure.nodes[coord.i], coord.x, coord.y));
        }
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