import type { Adventure } from '@backend/models/Adventure'
import type { Node } from '@backend/models/Node'
import { get, writable } from 'svelte/store'
import { getAdventure } from '../utils/api'

export const createAdventureStore = () => {
    const adventureStore = writable<Adventure | undefined>(undefined)
    return {
        subscribe: adventureStore.subscribe,
        setAdventure: async (author: string, adventureName: string) => {
            const adventure = await getAdventure(
                author,
                adventureName
            );
            adventureStore.set(adventure);
        },
        getNodeById: (id: string): Node | undefined => {
            const adventure = get(adventureStore)
            return adventure?.nodes[id]
        },
    }
}

export const adventureStore = createAdventureStore()
export type AdventureStore = typeof adventureStore;

export const createCurrenctActiveNode = () => {
    const val = writable<string | undefined>();
    const {subscribe, set} = val;
    adventureStore.subscribe((newAdventure) => {
        if (newAdventure?.start !== get(val)) {
            set(newAdventure?.start)
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
        }
    }
}

export const currentActiveNode = createCurrenctActiveNode()
