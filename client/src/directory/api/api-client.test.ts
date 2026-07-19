import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_DIRECTORY_QUERY } from '@presight/shared';
import { appendCursor, directoryApi } from './api-client';

afterEach(() => vi.restoreAllMocks());

describe('directory API client', () => {
  it('keeps users and facets as separate URL requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
    await directoryApi.users({ ...DEFAULT_DIRECTORY_QUERY, q: 'Ada', nationality: ['Canadian'] });
    await directoryApi.facets(DEFAULT_DIRECTORY_QUERY);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/api/users?nationality=Canadian&q=Ada');
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:3000/api/facets');
  });

  it('adds a cursor only to the subsequent users request', () => {
    expect(appendCursor(DEFAULT_DIRECTORY_QUERY, 'opaque').cursor).toBe('opaque');
  });
});
