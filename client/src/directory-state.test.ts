import { describe, expect, it } from 'vitest';
import { DEFAULT_DIRECTORY_QUERY } from '@presight/shared';
import { directoryReducer, initialDirectoryState } from './directory-state';

const user = (id: string) => ({ id, avatar: '', firstName: id, lastName: 'User', age: 30, nationality: 'Canadian', hobbies: [] });

describe('directory state', () => {
  it('resets the cursor and users when query changes', () => {
    let state = initialDirectoryState(DEFAULT_DIRECTORY_QUERY);
    state = directoryReducer(state, { type: 'usersSucceeded', items: [user('one')], hasMore: true, nextCursor: 'next', append: false });
    state = directoryReducer(state, { type: 'queryChanged', query: { ...DEFAULT_DIRECTORY_QUERY, q: 'Ada' } });
    expect(state.users).toEqual([]);
    expect(state.nextCursor).toBeNull();
    expect(state.query.q).toBe('Ada');
  });

  it('appends a page and clears loading state', () => {
    let state = initialDirectoryState(DEFAULT_DIRECTORY_QUERY);
    state = directoryReducer(state, { type: 'usersSucceeded', items: [user('one')], hasMore: true, nextCursor: 'next', append: false });
    state = directoryReducer(state, { type: 'usersStarted', append: true });
    state = directoryReducer(state, { type: 'usersSucceeded', items: [user('two')], hasMore: false, nextCursor: null, append: true });
    expect(state.users.map(({ id }) => id)).toEqual(['one', 'two']);
    expect(state.hasMore).toBe(false);
    expect(state.loadingMore).toBe(false);
  });

  it('preserves users and separates append errors from initial errors', () => {
    let state = initialDirectoryState(DEFAULT_DIRECTORY_QUERY);
    state = directoryReducer(state, { type: 'usersSucceeded', items: [user('one')], hasMore: true, nextCursor: 'next', append: false });
    state = directoryReducer(state, { type: 'usersStarted', append: true });
    state = directoryReducer(state, { type: 'usersFailed', message: 'append failed', append: true });
    expect(state.users.map(({ id }) => id)).toEqual(['one']);
    expect(state.error).toBeNull();
    expect(state.appendError).toBe('append failed');
    expect(state.nextCursor).toBe('next');
  });

  it('clears an append error when retrying the current page', () => {
    let state = initialDirectoryState(DEFAULT_DIRECTORY_QUERY);
    state = directoryReducer(state, { type: 'usersSucceeded', items: [user('one')], hasMore: true, nextCursor: 'next', append: false });
    state = directoryReducer(state, { type: 'usersFailed', message: 'append failed', append: true });
    state = directoryReducer(state, { type: 'usersStarted', append: true });
    expect(state.appendError).toBeNull();
    expect(state.nextCursor).toBe('next');
  });
});
