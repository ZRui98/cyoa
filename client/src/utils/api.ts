import type { Adventure, AdventureSummary } from '@backend/models/Adventure';
import { ApiError } from '@backend/utils/error';
import { env } from '$env/dynamic/public';
import type { ManagedAssetResponse } from '@backend/models/Asset';
import type { LoginState } from '../store/loginState';

type FetchFunction = typeof fetch;
export async function getAdventure(author: string, storyName: string): Promise<Adventure> {
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

export async function saveAdventure(adventure: Adventure | undefined, fetchImpl?: FetchFunction): Promise<void> {
  const url = `${env.PUBLIC_API_BASE_PATH}/adventure`;
  if (!adventure) return;
  return await fetchApi<void>(url, fetchImpl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adventure)
  });
}

export async function getAssets(fetchImpl?: FetchFunction): Promise<ManagedAssetResponse[]> {
  const url = `${env.PUBLIC_API_BASE_PATH}/asset`;
  const response = fetchApi<ManagedAssetResponse[]>(url, fetchImpl);
  return response;
}

export async function updateAsset(
  id?: number,
  newName?: string,
  file?: File,
  fetchImpl?: FetchFunction
): Promise<ManagedAssetResponse | null> {
  let url = `${env.PUBLIC_API_BASE_PATH}/asset`;
  if (id) {
    url = `${url}/${id}`;
  }
  const formData = new FormData();
  const name = newName ?? file?.name;
  formData.append('name', name!);
  formData.append('', file ?? new File([''], ''));
  return fetchApi<ManagedAssetResponse | null>(url, fetchImpl, {
    method: id ? 'PUT' : 'POST',
    body: formData,
  });
}

export async function deleteAsset(id: number, fetchImpl?: FetchFunction): Promise<ManagedAssetResponse | null> {
  const url = `${env.PUBLIC_API_BASE_PATH}/asset/${id}`;
  return fetchApi<ManagedAssetResponse | null>(url, fetchImpl, { method: 'DELETE' });
}

export async function getUserStatus(fetchImpl?: FetchFunction): Promise<LoginState> {
  const url = `${env.PUBLIC_API_BASE_PATH}/auth/status`;
  const response = await fetchApi<LoginState>(url, fetchImpl, { credentials: 'include' });
  return response;
}

export async function activateUser(name: string, fetchImpl?: FetchFunction): Promise<boolean> {
  const url = `${env.PUBLIC_API_BASE_PATH}/auth/activate`;
  const resp = await fetchApi<boolean>(url, fetchImpl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  return resp;
}

async function fetchApi<T>(url: string, fetchImpl = fetch, options?: RequestInit): Promise<T> {
  const resp = await fetchImpl(url, { ...options, credentials: 'include' });
  const text = await resp.text();
  const body = text === "" ? undefined : JSON.parse(text);
  if (!resp.ok) {
    throw new ApiError(resp.status, body.message);
  }
  return body as T;
}
