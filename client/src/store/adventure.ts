import type { Adventure } from '@backend/models/Adventure';
import type { Edge, Node } from '@backend/models/Node';
import { get, writable } from 'svelte/store';
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
        adventureStore.update((adventure) => {
          delete adventure?.nodes[nodeKey];
          return adventure;
        });
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
          const index = adventure.nodes[nodeKey].links.findIndex(
            (val) => val.next === edge.next && val.prompt === edge.prompt
          );
          if (index >= 0) adventure.nodes[nodeKey].links.splice(index, 1);
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
        start: '',
      });
    },
  };
};

export const adventureStore = createAdventureStore();

export type AdventureStore = typeof adventureStore;

export type GraphNode = {
  name: string;
  links: Pick<Edge, 'next'>[];
};

export type Graph = {
  start: string;
  nodes: { [key: string]: GraphNode };
};

export const createGraphRenderStore = (adventureStore: AdventureStore) => {
  const val = writable<Graph | undefined>();
  const { subscribe, set } = val;

  function convertAdventureToGraph(adventure: Adventure | undefined): Graph | undefined {
    const nodes = adventure?.nodes;
    if (!nodes) return;
    const newNodes = Object.keys(nodes).reduce((acc: { [key: string]: GraphNode }, key: string) => {
      const { name, links } = nodes[key];
      acc[key] = {
        name,
        links: links.map(({ next }) => ({ next })),
      };
      return acc;
    }, {});
    return {
      start: adventure.start,
      nodes: newNodes,
    };
  }

  adventureStore.subscribe((newAdventure) => {
    const graph = get(val);
    const newGraph = convertAdventureToGraph(newAdventure);
    if (JSON.stringify(graph) === JSON.stringify(newGraph) && graph?.start === newGraph?.start) return;
    set(newGraph);
  });
  return {
    subscribe,
    set,
  };
};

export const graphRenderStore = createGraphRenderStore(adventureStore);
export type GraphRenderStore = typeof graphRenderStore;

export const createCurrenctActiveNode = (adventureStore: AdventureStore) => {
  const store = writable<{ id: string; author: string; adventureName: string; content: string } | undefined>();
  const { subscribe } = store;

  const valSet = (
    id: string | undefined,
    author: string | undefined = undefined,
    adventureName: string | undefined = undefined
  ) => {
    if (id) {
      const newHash = `#${id}`;
      location.replace(newHash);
      const currentVal = get(store);
      const content: GraphNode | undefined = get(adventureStore)?.nodes[id];
      const contentStr = JSON.stringify(content);
      if (id === currentVal?.id && currentVal.content === contentStr) return;
      const newVal = {
        id,
        author: author ?? currentVal!.author,
        adventureName: adventureName ?? currentVal!.adventureName,
        content: contentStr,
      };
      store.set(newVal);
    }
  };

  adventureStore.subscribe((newAdventure) => {
    if (newAdventure === undefined) {
      store.set(undefined);
      return;
    }
    const currentVal = get(store);
    const sameAdventure = newAdventure.name === currentVal?.adventureName && currentVal?.author === newAdventure.author;
    let newNode = newAdventure.start;
    if (sameAdventure && newAdventure.nodes[currentVal.id]) {
      newNode = currentVal.id;
    }
    valSet(newNode, newAdventure.author, newAdventure.name);
  });
  return {
    subscribe,
    set: valSet,
  };
};

export const currentActiveNode = createCurrenctActiveNode(adventureStore);
