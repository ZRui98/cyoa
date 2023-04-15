import type { Adventure } from "@backend/Adventure";
import type { Node } from "@backend/Node";
import {
  get,
  writable,
  type Writable,
} from "svelte/store";
import * as sampleAdventure from "../assets/sample-story.json";

export const createAdventureStore = () => {
  const adventureStore = writable<Adventure|undefined>(undefined)
  // eslint-disable-next-line @typescript-eslint/no-empty-function

  return {
    subscribe: adventureStore.subscribe,
    setAdventure: async (id: string) => {
      return new Promise(r => setTimeout(r, 500)).then(() => {
        const loadedAdventure = sampleAdventure as unknown as Adventure;
        adventureStore.set(loadedAdventure);
      });
    },
    getNodeById: (id: string): Node | undefined => {
      const adventure = get(adventureStore);
      return adventure?.nodes[id]
    }
  }
}

export const adventureStore = createAdventureStore();
export type AdventureStore = typeof adventureStore;



export const createCurrenctActiveNode = (): Writable<string|undefined> => {
  const val = writable<string|undefined>();
  adventureStore.subscribe(newAdventure => {
    if (newAdventure?.start !== get(val)) {
      val.set(newAdventure?.start);
    }
  });
  return val;
}

export const currentActiveNode = createCurrenctActiveNode();