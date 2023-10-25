import { browser } from '$app/environment';
import { get } from 'svelte/store';
import loginState from '../../../store/loginState';
import { getUserStatus } from '../../../utils/api';
import { redirect } from '@sveltejs/kit';

export async function load({ fetch }) {
  if (browser) {
    if (!get(loginState)) {
      const newLoginState = await getUserStatus(fetch);
      loginState.set(newLoginState);
      if (!newLoginState?.user) {
        throw redirect(308, '/login');
      }
      if (!newLoginState?.activated) {
        throw redirect(308, '/activate');
      }
    }
  }
}

export const trailingSlash = "never";
export const prerender = true;
export const ssr = false;
