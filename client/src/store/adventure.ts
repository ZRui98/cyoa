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
    addAsset: (nodeKey: string, asset: Asset) => {
      adventureStore.update((adventure) => {
        if (!adventure) return;
        if (adventure.nodes[nodeKey]) {
          adventure.nodes[nodeKey].assets!.push(asset);
        }
        return adventure;
      });
    },
    updateAsset: (nodeKey: string, index: number, asset: Asset) => {
      adventureStore.update((adventure) => {
        if (!adventure) return;
        if (adventure.nodes[nodeKey] && adventure.nodes[nodeKey].assets.length > index) {
          adventure.nodes[nodeKey].assets[index] = asset;
        }
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

export const createCurrenctActiveNode = () => {
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

export const currentActiveNode = createCurrenctActiveNode();
