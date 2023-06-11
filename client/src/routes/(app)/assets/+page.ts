import { getAssets } from '../../../utils/api.js';

export async function load() {
    const assets = await getAssets();
    return {assets};
}

export const ssr = false;