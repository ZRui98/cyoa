import { BROWSER } from 'esm-env';
import { get } from 'svelte/store';
import loginState from '../../../store/loginState';
import { getUserStatus } from '../../../utils/api';

export async function load({ fetch }) {
  if (BROWSER) {
    if (!get(loginState)) {
      const newLoginState = await getUserStatus(fetch);
      loginState.set(newLoginState);
    }
  }
}

export const prerender = false;
