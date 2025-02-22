<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { NodeGraphics } from '../../pixi/NodeGraphics';
  import { PixiApplication } from '../../pixi/PixiApplication';
  import { GraphMenu } from '../../pixi/GraphMenu'
  import { PixiZoomPanContainer } from '../../pixi/PixiZoomPanContainer';
  import type { IApplicationOptions } from 'pixi.js';
  import { graphRenderStore, type Graph } from '../../../store/adventure';
  import { getRenderableGraph } from '../../../utils/createGraph';
  import { ArrowGraphics } from '../../pixi/ArrowGraphics';
  import type { Unsubscriber } from 'svelte/store';
  import { toast } from 'svelte-sonner';
  let zoomContainer: PixiZoomPanContainer;
  let menu: GraphMenu;
  let div: HTMLElement;
  let pixi: PixiApplication;
  let unsubGraphStore: Unsubscriber;
  let menuState = writable({arrowStart: null, arrowEnd: null});

  onMount(() => {
    pixi = new PixiApplication({
      resizeTo: div,
      backgroundColor: '#191724',
    } as IApplicationOptions);
    pixi.application.stage.eventMode = 'static';
    zoomContainer = new PixiZoomPanContainer(div);
    menu = new GraphMenu(div);
    pixi.application.stage.addChild(menu);
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
    if (unsubGraphStore) unsubGraphStore();
  });

  function drawGraph(graph: Graph) {
    if (!graph.nodes[graph.start]) return;
    try {
      const { nodes, edges } = getRenderableGraph(graph);
      edges
        .filter((e) => !e.isSimple)
        .forEach((e) => zoomContainer.addChild(new ArrowGraphics(e.points, e.isDotted, e.to, e.from)));
      edges
        .filter((e) => e.isSimple)
        .forEach((e) => zoomContainer.addChild(new ArrowGraphics(e.points, e.isDotted, e.to, e.from)));
      for (const coord of nodes) {
        zoomContainer.addChild(new NodeGraphics(coord.id, graph.nodes[coord.id], coord.x, coord.y));
      }
    } catch (e) {
      console.log(e);
      toast.error('Error rendering graph');
    }
  }
</script>

<div bind:this={div} />

<style>
  div {
    flex: 1;
    width: 100%;
    height: 100%;
  }
</style>
