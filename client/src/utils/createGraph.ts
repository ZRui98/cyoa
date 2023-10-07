import type { Node } from '@backend/models/Node';
import { Queue } from '@datastructures-js/queue';
import {
  Direction,
  MIN_DIST_BETWEEN_NODES_X,
  MIN_DIST_BETWEEN_NODES_Y,
  NODE_HEIGHT,
  NODE_WIDTH,
} from '../components/pixi/constants';
import type { Graph } from '../store/adventure';

export function createGraph() {
  return;
}

// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
export function hasCycle(graph: Graph): boolean {
  const { nodes } = graph;
  const L: string[] = [];
  const keys = Object.keys(nodes);
  const indegrees: { [key: string]: number } = keys.reduce((acc: { [key: string]: number }, curr) => {
    acc[curr] = 0;
    return acc;
  }, {});

  for (const key of keys) {
    const node = nodes[key];
    if (!node.links) continue;
    for (const v of node.links) {
      if (!v.next) continue;
      indegrees[v.next] = (indegrees[v.next] ?? 0) + 1;
    }
  }
  const S: Queue<string> = new Queue(Object.keys(nodes).filter((key: string) => indegrees[key] === 0));
  while (!S.isEmpty()) {
    const n = S.pop();
    L.push(n);
    for (const v of nodes[n].links) {
      const m = v.next;
      indegrees[m]--;
      if (indegrees[m] <= 0) {
        S.push(m);
      }
    }
  }

  const edgesRemaining: number = Object.values(indegrees).reduce((curr, acc: number) => acc + curr, 0);
  return edgesRemaining !== 0;
}

function getCurvePoints(
  start: { x: number; y: number },
  end: { x: number; y: number }
): {
  start: { x: number; y: number };
  end: { x: number; y: number };
  cp: { x: number; y: number }[];
} {
  const startPos = [
    { x: start.x + NODE_WIDTH / 2, y: start.y - 10 },
    {
      x: start.x + NODE_WIDTH + 10,
      y: start.y + NODE_HEIGHT / 2,
    },
    {
      x: start.x + NODE_WIDTH / 2,
      y: start.y + NODE_HEIGHT + 10,
    },
    { x: start.x - 10, y: start.y + NODE_HEIGHT / 2 },
  ];
  const endPos = [
    { x: end.x + NODE_WIDTH / 2, y: end.y - 10 },
    {
      x: end.x + NODE_WIDTH + 10,
      y: end.y + NODE_HEIGHT / 2,
    },
    {
      x: end.x + NODE_WIDTH / 2,
      y: end.y + NODE_HEIGHT + 10,
    },
    { x: end.x - 10, y: end.y + NODE_HEIGHT / 2 },
  ];
  let min: number | undefined = undefined;
  let shortestStart: { x: number; y: number } = startPos[0];
  let shortestEnd: { x: number; y: number } = endPos[0];
  for (const s of startPos) {
    for (const e of endPos) {
      const dist = Math.sqrt(Math.pow(s.x - e.x, 2) + Math.pow(s.y - e.y, 2));
      if (!min || dist < min) {
        min = dist;
        shortestStart = s;
        shortestEnd = e;
      }
    }
  }
  const is180Curve = shortestStart.x === shortestEnd.x || shortestStart.y === shortestEnd.y;
  let cp: { x: number; y: number }[];
  if (!is180Curve) {
    cp = [{ x: shortestEnd.x, y: shortestStart.y }];
  } else {
    const midX = (shortestEnd.x + shortestStart.x) / 2;
    const midY = (shortestEnd.y + shortestStart.y) / 2;
    if (shortestStart.x === shortestEnd.x) {
      cp = [
        { x: shortestStart.x, y: midY },
        { x: shortestEnd.x, y: midY },
      ];
    } else {
      cp = [
        { x: midX, y: shortestStart.y },
        { x: midX, y: shortestEnd.y },
      ];
    }
  }
  return { start: shortestStart, end: shortestEnd, cp };
}

export function processLayersToCoords(
  layers: Set<string>[],
  edgeLayers: string[][][]
): {
  nodes: { x: number; y: number; i: string }[];
  edges: { points: number[][]; isSimple: boolean; isDotted: boolean }[];
} {
  if (layers[0].size !== 1) {
    throw new Error('unexpected start layer');
  }
  let posY = 80 - NODE_HEIGHT / 2;
  let nodes: { x: number; y: number; i: string }[] = [];
  const edges: { points: number[][]; isSimple: boolean; isDotted: boolean; doubleSided: boolean }[] = [];
  for (let i = 0; i < layers.length; i++) {
    const layer = [];
    let posX =
      -(((layers[i].size - 1) / 2) * NODE_WIDTH + (Math.max(layers[i].size - 1, 0) / 2) * MIN_DIST_BETWEEN_NODES_X) -
      NODE_WIDTH / 2;
    for (const node of layers[i]) {
      layer.push({ x: posX, y: posY, i: node });
      posX += NODE_WIDTH + MIN_DIST_BETWEEN_NODES_X;
    }
    nodes = [...nodes, ...layer];
    posY += NODE_HEIGHT + MIN_DIST_BETWEEN_NODES_Y;
  }
  for (let i = 0; i < edgeLayers.length; i++) {
    for (const edge of edgeLayers[i]) {
      if (!layers[i].has(edge[0])) throw new Error('Unexpected issue in creating edges');
      const startNode = nodes.find((node) => node.i === edge[0]);
      const endNode = nodes.find((node) => node.i === edge[1]);
      let isCrossAdjacentEdge = false;
      let horizontalEdgeDiff: number | undefined;
      if (layers[i]?.has(edge[1])) {
        const startNodePos = [...layers[i]].findIndex((id) => id === edge[0]);
        const endNodePos = [...layers[i]].findIndex((id) => id === edge[1]);
        horizontalEdgeDiff = Math.abs(endNodePos - startNodePos);
        if (horizontalEdgeDiff === 1) {
          isCrossAdjacentEdge = true;
        }
      }
      const isSimpleEdge = layers[i + 1]?.has(edge[1]);
      if (!startNode || !endNode) continue;
      let startX: number;
      let startY: number;
      let endX: number;
      let endY: number;
      let points: number[][];
      if (!isSimpleEdge || isCrossAdjacentEdge) {
        if (horizontalEdgeDiff && horizontalEdgeDiff > 1) {
          startX = startNode.x + NODE_WIDTH / 2;
          startY = startNode.y + NODE_HEIGHT + 10;
          endX = endNode.x + NODE_WIDTH / 2;
          endY = endNode.y + NODE_HEIGHT + 10;
          const midX = (startX + startY) / 2;
          const midY = horizontalEdgeDiff * 40 + startNode.y + NODE_HEIGHT + 10;
          points = [
            [startX, startY],
            [midX, midY],
            [endX, endY],
          ];
        } else {
          const { start, end, cp } = getCurvePoints(startNode, endNode);
          startX = start.x;
          startY = start.y;
          endX = end.x;
          endY = end.y;
          points = [[startX, startY], ...cp.map(({ x, y }) => [x, y]), [endX, endY]];
        }
      } else {
        startX = startNode.x + NODE_WIDTH / 2;
        startY = startNode.y + NODE_HEIGHT + 10;
        endX = endNode.x + NODE_WIDTH / 2;
        endY = endNode.y - 10;
        const midY = (endY + startY) / 2;
        points = [
          [startX, startY],
          [startX, midY],
          [endX, midY],
          [endX, endY],
        ];
      }
      edges.push({
        points,
        isSimple: isSimpleEdge,
        doubleSided: false,
        isDotted: !(isSimpleEdge || isCrossAdjacentEdge),
      });
    }
  }
  return { nodes, edges };
}

export function getWidthAndHeight(graph: Graph): { layers: Set<string>[]; edgeLayers: string[][][] } {
  let q: Queue<string> = new Queue();
  q.push(graph.start);
  const visitedLayers: Set<string>[] = [];
  const visited: Set<string> = new Set();
  const edgeLayers = [];
  while (!q.isEmpty()) {
    const layer: Set<string> = new Set();
    const edgeLayer: string[][] = [];
    const nextQ: Queue<string> = new Queue();
    while (!q.isEmpty()) {
      const n = q.pop();
      if (visited.has(n)) continue;
      layer.add(n);
      visited.add(n);
      const node = graph.nodes[n];
      node.links.forEach((e) => {
        edgeLayer.push([n, e.next]);
        nextQ.push(e.next);
      });
    }
    if (layer.size > 0) visitedLayers.push(layer);
    if (edgeLayer.length > 0) edgeLayers.push(edgeLayer);
    q = nextQ;
  }
  const unconnectedNodes: Set<string> = new Set();
  for (const node of Object.keys(graph.nodes)) {
    if (!visited.has(node)) {
      unconnectedNodes.add(node);
    }
  }
  const layers = [...visitedLayers, unconnectedNodes];
  return { layers, edgeLayers };
}

export function getRenderableGraph(graph: Graph) {
  const { layers, edgeLayers } = getWidthAndHeight(graph);
  const { nodes, edges } = processLayersToCoords(layers, edgeLayers);
  return { nodes, edges };
}
