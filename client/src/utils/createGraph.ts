import type { Node } from '@backend/models/Node';
import { Queue } from '@datastructures-js/queue';
import {
  MIN_DIST_BETWEEN_NODES_X,
  MIN_DIST_BETWEEN_NODES_Y,
  NODE_HEIGHT,
  NODE_WIDTH,
} from '../components/pixi/constants';
import type { Graph, GraphNode } from '../store/adventure';

export function getDegreesAndInverse(graph: {[key: string] : GraphNode}): {[key: string]: {in: number, out: number, inverse: string[]}} {
  const degrees: {[key: string]: {in: number, out: number, inverse: string[]}} = {};
  for (const key of Object.keys(graph)) {
    if (!degrees[key]) {
      degrees[key] = {in: 0, out: 0, inverse: []};
    }
    degrees[key].out = graph[key].links.length;
    for (const inKey of graph[key].links.map(link => link.next)) {
      if (!degrees[inKey]) {
        degrees[inKey] = {in: 0, out: 0, inverse: []};
      }
      degrees[inKey].in = degrees[inKey].in + 1;
      degrees[inKey].inverse.push(key);
    }
  }
  return degrees;
}

// Using Greedy FAS Algorithm
function getFeedbackArcSet(graph: {[key: string] : GraphNode}) {
  const G: {[key: string]: GraphNode} = JSON.parse(JSON.stringify(graph));
  const degrees = getDegreesAndInverse(graph);
  let s1: string[] = [], s2: string[] = [];
  while (Object.keys(G).length > 0) {
    let sink: string | undefined;
    do {
      sink = Object.keys(degrees).find(key => degrees[key].out === 0);
      if (!sink) continue;
      s2 = [sink, ...s2];
      deleteNodeFromDegreeList(degrees, G, sink);
    } while(sink);
    let source: string | undefined;
    do {
      source = Object.keys(degrees).find(key => degrees[key].out === 0);
      if (!source) continue;
      s1 = [...s1, source];
      deleteNodeFromDegreeList(degrees, G, source);
    } while(source);
    let max: string | undefined;
    for (const dKey of Object.keys(degrees)) {
      const d = degrees[dKey].out - degrees[dKey].in;
      if (!max) {
        max = dKey;
      } else {
        const maxVal = degrees[max].out - degrees[max].in;
        if (d > maxVal) {
          max = dKey;
        }
      }
    }
    if (max) {
      deleteNodeFromDegreeList(degrees, G, max);
      s1 = [...s1, max];
    }
  }
  const seq = [...s1, ...s2];
  const fasGraph: {[key: string]: string[]} = {};
  for (let i = 0; i < seq.length; i++) {
    if (!fasGraph[seq[i]]) fasGraph[seq[i]] = [];
    for (let j = i + 1; j < seq.length; j++) {
      if (graph[seq[j]].links.findIndex(e => e.next == seq[i]) >= 0) {
        if (!fasGraph[seq[j]]) {
          fasGraph[seq[j]] = [];
        }
        fasGraph[seq[j]].push(seq[i]);
      }
    }
  }
  return fasGraph;
}

function deleteNodeFromDegreeList(degrees: {[key: string]: {in: number, out: number, inverse: string[]}}, G: {[key: string]: GraphNode}, target: string) {
  degrees[target].inverse.forEach(invKey => {
    if (degrees[invKey]) {
      degrees[invKey].out = degrees[invKey].out - 1;
    }
  });
  G[target].links.forEach(({next}) => {
    if (degrees[next]) {
      degrees[next].in = degrees[next].in - 1;
    }
  });
  delete degrees[target];
  delete G[target];
}

function longestPathLayering(graph: {[key: string]: GraphNode}, start?: string) {
  const U: Set<string> = new Set();
  let Z: Set<string> = new Set();
  const layers: string[][] = [[]];
  let currentLayer = 1;
  if (start) {
    Z.add(start);
    U.add(start);
    currentLayer += 1;
    console.log(layers[0]);
    layers[0].push(start);
    layers.push([]);
  }

  const V = Object.keys(graph);
  const inv = getDegreesAndInverse(graph);
  while (U.size < V.length) {
    // V\U
    const VdU = V.filter(v => !U.has(v));
    // find a v in V\U with N_+^G C Z
    const selected = VdU.find(v => {
      
      const successors = inv[v].inverse//graph[v].links.map(l => l.next);
      return successors.every(s => Z.has(s));
    })
    if (selected) {
      layers[currentLayer - 1].push(selected);
      U.add(selected);
    } else {
      Z = new Set([...Z, ...U]);
      currentLayer += 1;
      layers.push([]);
    }
  }
  return layers;
}

function promoteVertex(v: string, layering: {[key: string]: number}, G: {[key: string]: {in: number, out: number, links: string[], inverse: string[]}}): number {
  let dummydiff = 0;
  for (const u of G[v].inverse) {
    if (layering[u] === layering[v] + 1) {
      dummydiff += promoteVertex(u, layering, G);
    }
  }
  layering[v] += 1;
  dummydiff = dummydiff - G[v].in + G[v].out;
  return dummydiff;
}

function promotionHeuristic(graph: {[key: string] : GraphNode}, layers: string[][]) {
  let layering: {[key: string]: number} = layers.reduce((acc: {[key: string]: number}, layer, i) => {
    layer.forEach(v => {acc[v] = i + 1});
    return acc;
  }, {});
  let layeringBackUp: {[key: string]: number} = JSON.parse(JSON.stringify(layering));
  let degreesAndInverse = getDegreesAndInverse(graph);
  let G = Object.keys(graph).reduce((
      acc:{[key: string]: {in: number, out: number, links: string[], inverse: string[]}}, 
      key
    ) => {
      acc[key] = {...degreesAndInverse[key], links: graph[key].links.map(l => l.next)}
      return acc;
  }, {});
  console.log(G);
  let promotions: number;
  do {
    promotions = 0;
    for (const v of Object.keys(G)) {
      if (G[v].in > 0) {
        if (promoteVertex(v, layering, G) < 0) {
          console.log('v', v, layering, G);
          promotions += 1;
          layeringBackUp = JSON.parse(JSON.stringify(layering));
        } else {
          layering = layeringBackUp;
        }
      }
    }
  } while (promotions != 0);
  return layering;
}

function addDummyNodes(G: {[key: string]: GraphNode}, layers: string[][]) {
  Object.keys(G).reduce((acc: string[][], u) => {
    const newEdges = G[u].links.map(v => [u,v.next]);
    return [...acc, ...newEdges];
  }, [])
}

export function createLayeredGraph(graph: Graph) {
  // Generate FS using Greedy FAS Algorithm
  const G: {[key: string] : GraphNode} = JSON.parse(JSON.stringify(graph.nodes));
  const fas = getFeedbackArcSet(G);
  // Reverse edges in FS to turn graph w/ cycle to DAG
  console.log(fas);
  for (const key in Object.keys(fas)) {
    if (fas[key].length <= 0) continue;
    for (const dest of fas[key]) {
      const idx = G[key].links.findIndex(e => e.next === dest);
      if (idx < 0) {
        throw Error(`something went wrong with generating the fas ${dest} ${idx} ${G[key].links}`);
      }
      G[key].links.splice(idx, 1);
      const alreadyExists = G[dest].links.findIndex(e => e.next === key) !== -1;
      if (alreadyExists) continue;
      G[dest].links.push({next: key});
      // debugger;
    }
  }
  // Find Layering for DAG
  const layers = longestPathLayering(G).reverse();
  console.log(layers)
  // const layering = promotionHeuristic(G, layers);
  // console.log('layering', layering);
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
  nodes: { x: number; y: number; id: string, i: number }[];
  edges: { points: number[][]; isSimple: boolean; isDotted: boolean, from: string, to: string }[];
} {
  if (layers[0].size !== 1) {
    throw new Error('unexpected start layer');
  }
  let posY = 80 - NODE_HEIGHT / 2;
  let nodes: { x: number; y: number; id: string, i: number }[] = [];
  const edges: { points: number[][]; isSimple: boolean; isDotted: boolean; from: string, to: string}[] = [];
  for (let i = 0; i < layers.length; i++) {
    const layer = [];
    let posX =
      -(((layers[i].size - 1) / 2) * NODE_WIDTH + (Math.max(layers[i].size - 1, 0) / 2) * MIN_DIST_BETWEEN_NODES_X) -
      NODE_WIDTH / 2;
    for (const node of layers[i]) {
      layer.push({ x: posX, y: posY, id: node, i });
      posX += NODE_WIDTH + MIN_DIST_BETWEEN_NODES_X;
    }
    nodes = [...nodes, ...layer];
    posY += NODE_HEIGHT + MIN_DIST_BETWEEN_NODES_Y;
  }
  for (let i = 0; i < edgeLayers.length; i++) {
    for (const edge of edgeLayers[i]) {
      if (!layers[i].has(edge[0])) throw new Error('Unexpected issue in creating edges');
      const startNode = nodes.find((node) => node.id === edge[0]);
      const endNode = nodes.find((node) => node.id === edge[1]);
      let isHorizontalAdjacentEdge = false;
      let horizontalEdgeDiff: number | undefined;
      if (layers[i]?.has(edge[1])) {
        const startNodePos = [...layers[i]].findIndex((id) => id === edge[0]);
        const endNodePos = [...layers[i]].findIndex((id) => id === edge[1]);
        horizontalEdgeDiff = Math.abs(endNodePos - startNodePos);
        if (horizontalEdgeDiff === 1) {
          isHorizontalAdjacentEdge = true;
        }
      }
      const isTightEdge = layers[i - 1]?.has(edge[1]) || layers[i + 1]?.has(edge[1]) || isHorizontalAdjacentEdge;
      if (!startNode || !endNode) continue;
      let startX: number;
      let startY: number;
      let endX: number;
      let endY: number;
      let points: number[][];
      if (!isTightEdge || isHorizontalAdjacentEdge) {
        if (horizontalEdgeDiff && horizontalEdgeDiff > 1) { // horizontal edge
          startX = startNode.x + NODE_WIDTH / 2;
          startY = startNode.y + NODE_HEIGHT + 10;
          endX = endNode.x + NODE_WIDTH / 2;
          endY = endNode.y + NODE_HEIGHT + 10;
          const midX = (startX + endX) / 2;
          const midY = horizontalEdgeDiff * 40 + startNode.y + NODE_HEIGHT;
          points = [
            [startX, startY],
            [midX, midY],
            [endX, endY],
          ];
        } else if (!isTightEdge && startNode.x === endNode.x){ // vertial edge
          let midX: number;
            if (startNode.y > endNode.y) {
              startX = startNode.x + NODE_WIDTH + 10;
              startY = startNode.y + NODE_HEIGHT / 2;
              endX = endNode.x + NODE_WIDTH + 10;
              endY = endNode.y + NODE_HEIGHT / 2;
              midX = Math.abs(endNode.i - startNode.i) * 40 + startNode.x + NODE_WIDTH;
            } else {
              startX = startNode.x - 10;
              startY = startNode.y + NODE_HEIGHT / 2;
              endX = endNode.x - 10;
              endY = endNode.y + NODE_HEIGHT / 2;
              midX =  startNode.x - Math.abs(endNode.i - startNode.i) * 40 - NODE_WIDTH;
            }
            const midY = (startY + endY) / 2;
            points = [
              [startX, startY],
              [midX, midY],
              [endX, endY]
            ];
        } else {// best fit edge
          const { start, end, cp } = getCurvePoints(startNode, endNode);
          startX = start.x;
          startY = start.y;
          endX = end.x;
          endY = end.y;
          points = [[startX, startY], ...cp.map(({ x, y }) => [x, y]), [endX, endY]];
        }
      } else {// hardcoded s edge
        let midY: number;
        if (layers[i - 1]?.has(edge[1])) {
          startX = startNode.x + NODE_WIDTH / 2;
          startY = startNode.y - 10;
          endX = endNode.x + NODE_WIDTH / 2;
          endY = endNode.y + NODE_HEIGHT + 10;
          midY = (endY + startY) / 2;
        } else {
          startX = startNode.x + NODE_WIDTH / 2;
          startY = startNode.y + NODE_HEIGHT + 10;
          endX = endNode.x + NODE_WIDTH / 2;
          endY = endNode.y - 10;
          midY = (endY + startY) / 2;
        }
        points = [
          [startX, startY],
          [startX, midY],
          [endX, midY],
          [endX, endY],
        ];
      }
      edges.push({
        points,
        from: edge[0],
        to: edge[0],
        isSimple: isTightEdge,
        isDotted: !isTightEdge
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
