import type { Adventure } from "@backend/Adventure";
import {env} from '$env/dynamic/public';
import type { AssetResponse } from "@backend/Asset";

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

export async function getAssets(): Promise<AssetResponse[]> {
    const url = `${env.PUBLIC_API_BASE_PATH}/asset`
    const response = await fetch(url).then(response => response.json());
    console.log('response', response);
    return response;
}

export async function updateAsset(id?: number, newName?: string, file?: File) {

    let url = `${env.PUBLIC_API_BASE_PATH}/asset`;
    if (id) {
        url = `${url}/${id}`;
    }
    console.log(url, id);
    const formData = new FormData();
    const name = newName ?? file?.name;
    formData.append('name', name!);
    formData.append('', file ?? new File([''], ''));
    const response = await fetch(url, {method: id ? 'PUT' : 'POST', body: formData});
    return;
} 