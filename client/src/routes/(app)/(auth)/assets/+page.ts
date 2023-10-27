import { getAssets } from '../../../../utils/api.js';

export async function load({ fetch }) {
    const assets = await getAssets(fetch, true);
    return { assets };
}

