import { writable } from "svelte/store";

export interface LoginState {
    username: string;
    token: string;
}

const loginState = writable<LoginState | undefined>(undefined);

export default loginState;