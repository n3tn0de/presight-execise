import { cleanup, renderHook, act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_DIRECTORY_QUERY } from '@presight/shared';
import { useDirectoryQuery } from './use-directory-query';
import { directoryApi } from './api-client';

vi.mock('./api-client', () => ({
  directoryApi: { users: vi.fn(), facets: vi.fn() },
  appendCursor: (query: any, cursor: string) => ({ ...query, cursor }),
}));

describe('useDirectoryQuery append requests', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });
  it('does not duplicate appends and aborts the append on query changes', async () => {
    const initial = Promise.resolve({ items: [{ id: 'one', avatar: '', firstName: 'One', lastName: 'User', age: 30, nationality: 'Canadian', hobbies: [] }], hasMore: true, nextCursor: 'next' });
    vi.mocked(directoryApi.users).mockReturnValueOnce(initial as any).mockReturnValue(new Promise(() => {}) as any);
    vi.mocked(directoryApi.facets).mockResolvedValue({ hobbies: [], nationalities: [] });
    const { result, rerender } = renderHook(({ query }) => useDirectoryQuery(query), { initialProps: { query: DEFAULT_DIRECTORY_QUERY } });
    await waitFor(() => expect(result.current.nextCursor).toBe('next'));
    act(() => { result.current.loadMore(); result.current.loadMore(); });
    const appendCalls = vi.mocked(directoryApi.users).mock.calls.filter(([query]) => query.cursor === 'next');
    expect(appendCalls).toHaveLength(1);
    const appendSignal = appendCalls[0][1] as AbortSignal;
    rerender({ query: { ...DEFAULT_DIRECTORY_QUERY, q: 'Ada' } });
    expect(appendSignal.aborted).toBe(true);
  });
});
