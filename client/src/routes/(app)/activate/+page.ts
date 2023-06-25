import { browser } from "$app/environment";
import { get } from "svelte/store";
import loginState from "../../../store/loginState";
import { redirect } from "@sveltejs/kit";

export async function load() {
    if (browser) {
        if (get(loginState)?.activated) {
            throw redirect(308, "/");
        }
    }
}