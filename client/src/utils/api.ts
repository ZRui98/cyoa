import type { Adventure } from "@backend/Adventure";
import {env} from '$env/dynamic/public';
import type { AssetMetaData } from "@backend/Asset";

export async function getAdventure(
    author: string,
    storyName: string
): Promise<Adventure> {
    // const url: string = await fetch(
    //     `${import.meta.env.BASE_URL}/adventure/${author}/${storyName}`
    // ).then(response => response.json());
    const url = `${env.PUBLIC_STORAGE_PATH}/user1/adventures/sample-story.json`;
    const response: Adventure = await fetch(url).then(
        response => response.json()
    );
    return response;
}

export async function getAssets(): Promise<AssetMetaData[]> {
    const url = `${env.PUBLIC_API_BASE_PATH}/asset`
    const response = await fetch(url).then(response => response.json());
    console.log('response', response);
    return response;
}