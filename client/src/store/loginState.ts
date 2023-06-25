import { get, writable } from "svelte/store";

export interface LoginState {
    user?: string;
    activated: boolean;
}

function createLoginState() {
    const state = writable<LoginState | undefined>(undefined);

    return {
        ...state
    }
}

const loginState = createLoginState();

export default loginState;