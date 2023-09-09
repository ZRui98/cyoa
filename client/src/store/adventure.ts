import type { Adventure } from '@backend/models/Adventure';
import type { Edge, Node } from '@backend/models/Node';
import { derived, get, writable } from 'svelte/store';
import { getAdventure } from '../utils/api';
import type { Asset } from '@backend/models/Asset';

export const createAdventureStore = () => {
  const adventureStore = writable<Adventure | undefined>(undefined);
  return {
    subscribe: adventureStore.subscribe,
    loadAdventure: async (author: string, adventureName: string) => {
      const adventure = await getAdventure(author, adventureName);
      adventureStore.set(adventure);
    },
    clearAdventure: () => {
      adventureStore.set(undefined);
    },
    getNodeById: (id: string): Node | undefined => {
      const adventure = get(adventureStore);
      return adventure?.nodes[id];
    },
    addNode: () => {
      const adventure = get(adventureStore);
    },
    removeNode: (nodeKey: string) => {
      const adventure = get(adventureStore);
      if (adventure?.nodes[nodeKey]) {
        adventureStore.update(adventure => {
          delete adventure?.nodes[nodeKey];
          return adventure;
        })
      }
    },
    addEdge: (nodeKey: string, edge: Edge) => {
      // const adventure = get(adventureStore);
      adventureStore.update((adventure) => {
        if (!adventure) return;
        if (adventure.nodes[nodeKey]) {
          if (!adventure.nodes[nodeKey].links) {
            adventure.nodes[nodeKey].links = [];
          }
          adventure.nodes[nodeKey].links!.push(edge);
        }
        return adventure;
      });
    },
    removeEdge: (nodeKey: string, edge: Edge) => {
      adventureStore.update((adventure) => {
        if (!adventure) return;
        if (adventure.nodes[nodeKey]) {
          const index = adventure.nodes[nodeKey].links.findIndex(val => val.next === edge.next && val.prompt === edge.prompt);
          if (index >= 0)
            adventure.nodes[nodeKey].links.splice(index, 1);
        }
        return adventure;
      });
    },
    addAsset: (nodeKey: string, asset: Asset) => {
      adventureStore.update((adventure) => {
        if (!adventure) return;
        if (adventure.nodes[nodeKey]) {
          adventure.nodes[nodeKey].assets!.push(asset);
        }
        return adventure;
      });
    },
    removeAsset: (nodeKey: string, index: number) => {
      const adventure = get(adventureStore);
      if (!adventure) return;
      if (!adventure.nodes[nodeKey] || adventure.nodes[nodeKey].assets.length <= index) {
        return;
      }
      adventureStore.update((adventure) => {
        adventure!.nodes[nodeKey].assets.splice(index, 1);
        return adventure;
      });
    },
    updateAsset: (nodeKey: string, index: number, asset: Asset) => {
      const adventure = get(adventureStore);
      if (!adventure) return;
      if (!adventure.nodes[nodeKey] || adventure.nodes[nodeKey].assets.length <= index) {
        return;
      }
      adventureStore.update((adventure) => {
        adventure!.nodes[nodeKey].assets[index] = asset;
        return adventure;
      });
    },
    updateAssets: (nodeKey: string, assets: Asset[]) => {
      adventureStore.update((adventure) => {
        if (!adventure) return;
        if (adventure.nodes[nodeKey]) {
          adventure.nodes[nodeKey].assets = assets;
        }
        return adventure;
      });
    },
    set: adventureStore.set,
    initializeAdventure: (author = 'anonymous') => {
      adventureStore.set({
        name: 'new-adventure',
        author,
        nodes: {},
        start: '0',
      });
    },
  };
};

export const adventureStore = createAdventureStore();

export type AdventureStore = typeof adventureStore;

export type GraphNode = {
  name: string,
  links: Pick<Edge, 'next'>[]
}

export type Graph = {
  start: string,
  nodes: { [key: string]: GraphNode }
};

export const createGraphRenderStore = (adventureStore: AdventureStore) => {
  const val = writable<Graph | undefined>();
  const { subscribe, set} = val;

  function convertAdventureToGraph(adventure: Adventure | undefined): Graph | undefined {
    const nodes = adventure?.nodes;
    if (!nodes) return;
    const newNodes = Object.keys(nodes).reduce((acc: { [key: string]: GraphNode }, key: string) => {
      const {name, links} = nodes[key];
      acc[key] = {
        name,
        links: links.map(({next}) => ({next}))
      }
      return acc;
    }, {});
    return {
      start: adventure.start,
      nodes: newNodes,
    }
  }

  adventureStore.subscribe((newAdventure) => {
    const graph = get(val);
    const newGraph = convertAdventureToGraph(newAdventure);
    if (JSON.stringify(graph) === JSON.stringify(newGraph) && graph?.start === newGraph?.start) return;
    set(newGraph);
  });
  return {
    subscribe,
    set
  }
}

export const graphRenderStore = createGraphRenderStore(adventureStore);
export type GraphRenderStore = typeof graphRenderStore;

export const createCurrenctActiveNode = (adventureStore: AdventureStore) => {
  const val = writable<string | undefined>();
  const { subscribe, set } = val;
  adventureStore.subscribe((newAdventure) => {
    if (newAdventure?.start !== get(val)) {
      set(newAdventure?.start);
    }
  });
  return {
    subscribe,
    set: (newVal: string | undefined) => {
      if (newVal && adventureStore.getNodeById(newVal)) {
        const newHash = `#${newVal}`;
        location.replace(newHash);
        set(newVal);
      }
    },
  };
};

export const currentActiveNode = createCurrenctActiveNode(adventureStore);
