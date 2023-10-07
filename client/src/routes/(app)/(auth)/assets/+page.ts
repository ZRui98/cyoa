import { redirect } from '@sveltejs/kit';
import { getAssets } from '../../../../utils/api.js';
import { isApiError } from '@backend/utils/error';

export async function load({ fetch }) {
  try {
    const assets = await getAssets(fetch);
    return { assets };
  } catch (e: unknown) {
    let err = e as Error;
    if (isApiError(err)) {
      if (err.code === 403) {
        throw redirect(308, '/activate');
      } else if (err.code === 401) {
        throw redirect(308, '/login');
      }
    }
  }
}

export const ssr = false;
