<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { NodeGraphics } from '../pixi/NodeGraphics';
  import { PixiApplication } from '../pixi/PixiApplication';
  import { PixiZoomPanContainer } from '../pixi/PixiZoomPanContainer';
  import type { IApplicationOptions } from 'pixi.js';
  import { graphRenderStore, type Graph } from '../../store/adventure';
  import { getWidthAndHeight, processLayersToCoords } from '../../utils/createGraph';
  import { ArrowGraphics } from '../pixi/ArrowGraphics';
  import type { Unsubscriber } from 'svelte/store';
  let zoomContainer: PixiZoomPanContainer;
  let div: HTMLElement;
  let pixi: PixiApplication;
  let unsubGraphStore: Unsubscriber;

  onMount(() => {
    pixi = new PixiApplication({
      resizeTo: div,
      backgroundColor: '#191724',
    } as IApplicationOptions);
    pixi.application.stage.eventMode = 'static';
    zoomContainer = new PixiZoomPanContainer(div);
    pixi.application.stage.addChild(zoomContainer);
    div.appendChild(pixi.application.view as unknown as Node);

    unsubGraphStore = graphRenderStore.subscribe((graph) => {
      zoomContainer.removeChildren();
      if (graph) {
        drawGraph(graph);
      }
    });

  });

  onDestroy(() => {
    zoomContainer?.removeAllListeners();
    zoomContainer?.destroy();
    unsubGraphStore();
  });

  function drawGraph(graph: Graph) {
    if (!graph.nodes[graph.start]) return;
    console.log('render', new Date());
    try {
      const { layers, edgeLayers } = getWidthAndHeight(graph.start, graph);
      const { nodes, edges } = processLayersToCoords(layers, edgeLayers);
      edges
        .filter((e) => !e.isSimple)
        .forEach((e) => zoomContainer.addChild(new ArrowGraphics(e.points, e.isSimple, e.dir)));
      edges
        .filter((e) => e.isSimple)
        .forEach((e) => zoomContainer.addChild(new ArrowGraphics(e.points, e.isSimple, e.dir)));
      for (const coord of nodes) {
        zoomContainer.addChild(new NodeGraphics(coord.i, graph.nodes[coord.i], coord.x, coord.y));
      }
    } catch (e) {
      console.log('graph has cycle!');
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
