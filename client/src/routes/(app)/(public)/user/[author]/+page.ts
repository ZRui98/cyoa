import { redirect } from '@sveltejs/kit';
import { getAdventureSummaries, getUser } from '../../../../../utils/api';

export async function load({ params, fetch }) {
  let user: { name: string; bio?: string } | undefined;
  try {
    const author = params.author;
    user = await getUser(author, fetch);
  } catch (e) {
    throw redirect(308, '/404');
  }
  const adventures = await getAdventureSummaries(params.author, fetch);
  return { adventures, user: user.name, bio: user.bio };
}

export const prerender = false;
