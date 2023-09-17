import { getAdventureSummaries } from '../../../../../utils/api';

export async function load({ params, fetch }) {
  const adventures = await getAdventureSummaries(params.author, fetch);
  return { adventures, user: params.author };
}

export const prerender = false;
