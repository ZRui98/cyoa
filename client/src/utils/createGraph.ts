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
  const indegrees: {[key: string]: number} = {};
  for (const key of Object.keys(graph)) {
    const node = graph[key];
    for (const v of node.links) {
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
  let visited: Set<string> = new Set();
  while (!q.isEmpty()) {
    const layer: string[] = []
    const nextQ: Queue<string> = new Queue();
    while (!q.isEmpty()) {
      const n = q.pop();
      layer.push(n);
      const node = graph[n];
      node.links.forEach((e) => {
        nextQ.push(e.next);
      })
    }
    layers.push(layer);
    q = nextQ;
  }
  
  visited = new Set();
  for (let i = layers.length - 1; i >= 0; i--) {
    for (let j = layers[i].length - 1; j >= 0; j--) {
      if (visited.has(layers[i][j])) {
        layers[i].splice(j, 1);
        continue;
      }
      visited.add(layers[i][j]);
    }
  }
  return layers;
}