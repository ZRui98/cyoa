import type { Adventure } from "@backend/Adventure";
import type { Node } from "@backend/Node";
import {
  derived,
  get,
  writable,
} from "svelte/store";
import * as sampleAdventure from "../assets/sample-story.json";

export const createAdventureStore = () => {
  const adventureStore = writable<Adventure|undefined>(undefined)
  // eslint-disable-next-line @typescript-eslint/no-empty-function

  return {
    subscribe: adventureStore.subscribe,
    setAdventure: async (id: string) => {
      console.log("loading adventure");
      return new Promise(r => setTimeout(r, 1000)).then(() => {
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

export const currentActiveNode = derived(adventureStore, ($adventure) => {
    return $adventure?.start
});