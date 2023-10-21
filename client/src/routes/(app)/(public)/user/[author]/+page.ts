import { redirect } from '@sveltejs/kit';
import { getAdventureSummaries, getUser } from '../../../../../utils/api';

export async function load({ params, fetch }) {
  try {
    await getUser(params.author, fetch);
  } catch (e) {
    throw redirect(308, '/404');
  }
  const adventures = await getAdventureSummaries(params.author, fetch);
  return { adventures, user: params.author };
}

export const prerender = false;
