import { browser } from '$app/environment';
import { get } from 'svelte/store';
import loginState from '../../../store/loginState';
import { getUserStatus } from '../../../utils/api';

export async function load({ fetch }) {
  if (browser) {
    console.log('layout load 22');
    if (!get(loginState)) {
      console.log('setting login state 22');
      const newLoginState = await getUserStatus(fetch);
      loginState.set(newLoginState);
    }
  }
}

export const prerender = true;
export const ssr = false;
