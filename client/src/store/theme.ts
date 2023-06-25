import { writable } from "svelte/store";
import { browser } from "$app/environment";

const storedTheme = browser ? localStorage.getItem("theme") : 'light';
export const theme = writable(storedTheme);
theme.subscribe(value => {
    if (!browser) return;
    localStorage?.setItem("theme", value === 'dark' ? 'dark' : 'light');
});