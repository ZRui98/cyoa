import type { Adventure, AdventureSummary } from "@backend/models/Adventure";
import { ApiError } from "@backend/utils/error";
import {env} from '$env/dynamic/public';
import type { AssetResponse } from "@backend/models/Asset";
import type { LoginState } from "../store/loginState";

type FetchFunction = typeof fetch;
export async function getAdventure(
    author: string,
    storyName: string
): Promise<Adventure> {
    // const url: string = await fetch(
    //     `${import.meta.env.BASE_URL}/adventure/${author}/${storyName}`
    // ).then(response => response.json());
    const url = `${env.PUBLIC_STORAGE_PATH}/user1/adventures/sample-story.json`;
    const response: Adventure = await fetchApi(url);
    return response;
}

export async function getAdventureSummaries(author: string, fetchImpl?: FetchFunction): Promise<AdventureSummary[]> {
    const url = `${env.PUBLIC_API_BASE_PATH}/adventure/${author}`;
    const response = await fetchApi<AdventureSummary[]>(url, fetchImpl);
    return response;
}

export async function getAssets(fetchImpl?: FetchFunction): Promise<AssetResponse[]> {
    const url = `${env.PUBLIC_API_BASE_PATH}/asset`;
    const response = fetchApi<AssetResponse[]>(url, fetchImpl);
    return response;
}

export async function updateAsset(id?: number, newName?: string, file?: File, fetchImpl?: FetchFunction): Promise<AssetResponse | null> {

    let url = `${env.PUBLIC_API_BASE_PATH}/asset`;
    if (id) {
        url = `${url}/${id}`;
    }
    const formData = new FormData();
    const name = newName ?? file?.name;
    formData.append('name', name!);
    formData.append('', file ?? new File([''], ''));
    return fetchApi<AssetResponse | null>(url, fetchImpl, {method: id? 'PUT' : 'POST', body: formData})
}

export async function deleteAsset(id: number, fetchImpl?: FetchFunction): Promise<AssetResponse | null> {
    const url = `${env.PUBLIC_API_BASE_PATH}/asset/${id}`;
    return fetchApi<AssetResponse | null>(url, fetchImpl, {method: 'DELETE'});
}

export async function getUserStatus(fetchImpl = fetch): Promise<LoginState> {
    const url = `${env.PUBLIC_API_BASE_PATH}/auth/status`;
    const resp = await fetchImpl(url, {credentials: 'include'});
    const body = await resp.json() as LoginState;
    return body;
}

export async function activateUser(name: string, fetchImpl?: FetchFunction): Promise<boolean> {
    const url = `${env.PUBLIC_API_BASE_PATH}/auth/activate`;
    const resp = await fetchApi<boolean>(url, fetchImpl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name})
    });
    return resp;
}

async function fetchApi<T>(url: string, fetchImpl = fetch, options?: RequestInit): Promise<T> {
    const resp = await fetchImpl(url, {...options, credentials: 'include'});
    const body = await resp.json();
    if (!resp.ok) {
        throw new ApiError(resp.status, body.message);
    }
    return body as T;
}