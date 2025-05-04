import { BROWSER } from 'esm-env';
import { get } from 'svelte/store';
import loginState from '../../../store/loginState';
import { getUserStatus } from '../../../utils/api';
import { redirect } from '@sveltejs/kit';

export async function load({ url, fetch }) {
  if (BROWSER) {
    console.log("in browser block");
    console.log(url.pathname)
    if (!get(loginState)) {
      const newLoginState = await getUserStatus(fetch);
      loginState.set(newLoginState);
      if (!newLoginState?.user && url.pathname !== '/login/') {
        throw redirect(308, '/login');
      }
      if (!newLoginState?.activated && url.pathname !== '/activate/') {
        throw redirect(308, '/activate');
      }
      if (newLoginState?.activated && url.pathname === '/activate/') {
        throw redirect(308, '/');
      }
    }
  }
}

export const prerender = false;
