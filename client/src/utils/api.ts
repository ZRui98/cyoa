import type { Adventure, AdventureSummary } from '@backend/models/Adventure';
import { ApiError } from '@backend/utils/error';
import { env } from '$env/dynamic/public';
import type { ManagedAssetResponse } from '@backend/models/Asset';
import type { LoginState } from '../store/loginState';

type FetchFunction = typeof fetch;
export async function getAdventure(author: string, storyName: string): Promise<Adventure> {
  const { url }: { url: string } = await fetch(`${env.PUBLIC_API_BASE_PATH}/adventure/${author}/${storyName}`).then(
    (response) => response.json()
  );
  console.log(url);
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
    body: JSON.stringify(adventure),
  });
}

export async function updateAdventure(
  adventureName: string,
  adventure: Adventure | undefined,
  fetchImpl?: FetchFunction
): Promise<void> {
  const url = `${env.PUBLIC_API_BASE_PATH}/adventure/${adventureName}`;
  if (!adventure) return;
  return await fetchApi<void>(url, fetchImpl, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adventure),
  });
}

export async function getAssets(fetchImpl?: FetchFunction, includePath = false): Promise<ManagedAssetResponse[]> {
  const url = `${env.PUBLIC_API_BASE_PATH}/asset?includePath=${includePath}`;
  const response = fetchApi<ManagedAssetResponse[]>(url, fetchImpl);
  return response;
}

export async function getAssetsByName(
  author: string,
  assetNames: string[],
  fetchImpl?: FetchFunction
): Promise<ManagedAssetResponse[]> {
  const url = `${env.PUBLIC_API_BASE_PATH}/asset/assetUrl/${author}?assetNames=${assetNames.join(',')}`;
  const response = fetchApi<ManagedAssetResponse[]>(url, fetchImpl);
  return response;
}

export async function updateAsset(
  name?: string,
  newName?: string,
  file?: File,
  fetchImpl?: FetchFunction
): Promise<ManagedAssetResponse | null> {
  let url = `${env.PUBLIC_API_BASE_PATH}/asset`;
  if (name) {
    url = `${url}/${name}`;
  }
  const formData = new FormData();
  const newFileName = newName ?? file?.name;
  formData.append('name', newFileName!);
  formData.append('', file ?? new File([''], ''));
  return fetchApi<ManagedAssetResponse | null>(url, fetchImpl, {
    method: name ? 'PUT' : 'POST',
    body: formData,
  });
}

export async function deleteAsset(name: string, fetchImpl?: FetchFunction): Promise<ManagedAssetResponse | null> {
  const url = `${env.PUBLIC_API_BASE_PATH}/asset/${name}`;
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
  const body = text === '' ? undefined : JSON.parse(text);
  if (!resp.ok) {
    throw new ApiError(resp.status, body.message);
  }
  return body as T;
}
