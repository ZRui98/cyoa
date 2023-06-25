import { browser } from "$app/environment";
import { get } from "svelte/store";
import loginState from "../../store/loginState";
import { getUserStatus } from "../../utils/api";

export async function load({fetch}) {
    if (browser){
        if (!get(loginState)) {
            const newLoginState = await getUserStatus(fetch);
            loginState.set(newLoginState);
        }
    }
}

export const prerender = true;
export const ssr = false;