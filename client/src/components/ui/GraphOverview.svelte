<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { Adventure } from "@backend/models/Adventure";
    import { NodeGraphics } from "../pixi/NodeGraphics";
    import { PixiApplication } from "../pixi/PixiApplication";
    import { PixiZoomPanContainer } from "../pixi/PixiZoomPanContainer";
    import type { IApplicationOptions } from "pixi.js";
    import {adventureStore } from "../../store/adventure";
    import { getWidthAndHeight, processLayersToCoords } from "../../utils/createGraph";
    import { ArrowGraphics } from "../pixi/ArrowGraphics";
    import type { Unsubscriber } from "svelte/store";
    let zoomContainer: PixiZoomPanContainer;
    let div: HTMLElement;
    let unsub: Unsubscriber;
  
    onMount(() => {
      const pixi = new PixiApplication({
          resizeTo: div,
          backgroundColor: "#191724",
      } as IApplicationOptions);
      pixi.application.stage.eventMode = 'static';
      zoomContainer = new PixiZoomPanContainer(div);
      pixi.application.stage.addChild(zoomContainer);
      div.appendChild(pixi.application.view as unknown as Node);
  
      unsub = adventureStore.subscribe((adventure) => {
        zoomContainer.removeChildren();
        if (adventure) {
          drawGraph(adventure);
        }
      });
    })
  
    onDestroy(() => {
      zoomContainer?.removeAllListeners();
      unsub();
    })
  
    function drawGraph(adventure: Adventure) {
      const graph = adventure.nodes;
      const {layers, edgeLayers} = getWidthAndHeight(adventure.start, graph);
      const {nodes, edges} = processLayersToCoords(layers, edgeLayers);
      edges.filter(e => !e.isSimple).forEach(e => zoomContainer.addChild(new ArrowGraphics(e.points, e.isSimple, e.dir)));
      edges.filter(e => e.isSimple).forEach(e => zoomContainer.addChild(new ArrowGraphics(e.points, e.isSimple, e.dir)));
      for (const coord of nodes) {
        zoomContainer.addChild(new NodeGraphics(coord.i, adventure.nodes[coord.i], coord.x, coord.y));
      }
    }
  
  </script>
  
  <div bind:this={div} />
  
  <style>
    div {
      width: 100%;
      height: 100%;
    }
  </style>