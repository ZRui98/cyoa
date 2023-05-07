import { writable } from "svelte/store";

const loginState = writable<string | undefined>(undefined);

export default loginState;