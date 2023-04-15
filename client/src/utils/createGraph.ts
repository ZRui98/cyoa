import type { Node } from "@backend/Node";
import { Queue } from '@datastructures-js/queue';

export function createGraph () {
  return;
}

// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
export function hasCycle(
  graph: {[key: string]: Node}
): boolean {
  const L: string[] = [];
  const keys = Object.keys(graph);
  const indegrees: {[key: string]: number} = keys.reduce((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {});

  for (const key of keys) {
    const node = graph[key];
    if (!node.links) continue;
    for (const v of node.links) {
      if (!v.next) continue;
      indegrees[v.next] = (indegrees[v.next] ?? 0) + 1;
    }
  }
  const S: Queue<string> = new Queue(
    Object.keys(graph).filter((key: string) =>  indegrees[key] === 0)
  );
  while (!S.isEmpty()) {
    const n = S.pop();
    L.push(n);
    for (const v of graph[n].links) {
      const m = v.next;
      indegrees[m]--;
      if (indegrees[m] <= 0) {
        S.push(m);
      }
    }
  }

  const edgesRemaining: number = Object.values(indegrees)
                      .reduce((curr, acc: number) => acc + curr, 0);
  return edgesRemaining !== 0;
}

const MIN_DIST_BETWEEN_NODES_X = 50;
const MIN_DIST_BETWEEN_NODES_Y = 155;
export function processLayersToCoords(layers: string[][]):
{x: number, y: number, i: string}[] {
  if (layers[0].length !== 1) {
    throw new Error("unexpected start layer");
  }
  let posY = 80;
  let nodes = [];
  for (let i = 0; i < layers.length; i++) {
    const layer = [];
    let posX = 0 - (layers[i].length - 1)/2 * 250 -
      (layers[i].length - 2)/2 * MIN_DIST_BETWEEN_NODES_X;
    for (const node of layers[i]) {
      layer.push({x: posX, y: posY, i: node});
      posX += (250 + MIN_DIST_BETWEEN_NODES_X);
    }
    nodes = [...nodes, ...layer];
    posY += (130 + MIN_DIST_BETWEEN_NODES_Y);
  }
  return nodes;
}

export function getWidthAndHeight(
  start: string,
  graph: {[key: string]: Node}
): string[][] {
  if (hasCycle(graph)) {
    throw new Error("Can't get width and height for graph with cycle");
  }
  let q: Queue<string> = new Queue();
  q.push(start);
  const layers: string[][] = [];
  const visited: Set<string> = new Set();
  while (!q.isEmpty()) {
    const layer: string[] = []
    const nextQ: Queue<string> = new Queue();
    while (!q.isEmpty()) {
      const n = q.pop();
      if(!visited.has(n))
        layer.push(n);
      visited.add(n);
      const node = graph[n];
      node.links.forEach((e) => {
        nextQ.push(e.next);
      })
    }
    if (layer.length > 0) layers.push(layer);
    q = nextQ;
  }
  
  return layers;
}