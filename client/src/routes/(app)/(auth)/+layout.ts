import { browser } from '$app/environment';
import { get } from 'svelte/store';
import loginState from '../../../store/loginState';
import { getUserStatus } from '../../../utils/api';
import { redirect } from '@sveltejs/kit';

export async function load({ url, fetch }) {
  if (browser) {
    if (!get(loginState)) {
      const newLoginState = await getUserStatus(fetch);
      loginState.set(newLoginState);
      if (!newLoginState?.user && url.pathname !== '/login') {
        throw redirect(308, '/login');
      }
      if (!newLoginState?.activated && url.pathname !== '/activate') {
        throw redirect(308, '/activate');
      }
      if (newLoginState?.activated && url.pathname === '/activate') {
        throw redirect(308, '/');
      }
    }
  }
}

export const prerender = false;
