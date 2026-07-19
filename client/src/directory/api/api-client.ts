import type { DirectoryQuery, FacetsResponse, UsersResponse } from '@presight/shared';
import { serializeDirectoryQuery } from '@presight/shared';
import { env } from '../../config/env';

function queryString(query: DirectoryQuery): string {
  const serialized = serializeDirectoryQuery(query);
  return serialized ? `?${serialized}` : '';
}

async function get<T>(path: string, query: DirectoryQuery, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${env.API_URL}${path}${queryString(query)}`, { signal });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export const directoryApi = {
  users(query: DirectoryQuery, signal?: AbortSignal) {
    return get<UsersResponse>('/api/users', query, signal);
  },
  facets(query: DirectoryQuery, signal?: AbortSignal) {
    return get<FacetsResponse>('/api/facets', query, signal);
  },
};

export function appendCursor(query: DirectoryQuery, cursor: string): DirectoryQuery {
  return { ...query, cursor };
}
