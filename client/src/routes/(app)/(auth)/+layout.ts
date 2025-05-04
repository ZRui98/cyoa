import { BROWSER } from 'esm-env';
import { get } from 'svelte/store';
import loginState from '../../../store/loginState';
import { getUserStatus } from '../../../utils/api';
import { redirect } from '@sveltejs/kit';

export async function load({ url, fetch }) {
  if (BROWSER) {
    if (!get(loginState)) {
      const newLoginState = await getUserStatus(fetch);
      loginState.set(newLoginState);
      if (!newLoginState?.user && /\/login\/?$/.test(url.pathname)) {
        throw redirect(308, '/login');
      }
      if (!newLoginState?.activated && !/\/activate\/?$/.test(url.pathname)) {
        throw redirect(308, '/activate');
      }
      if (newLoginState?.activated && /\/activate\/?$/.test(url.pathname)) {
        throw redirect(308, '/');
      }
    }
  }
}

export const prerender = false;
