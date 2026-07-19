import { useEffect, useReducer, useRef } from 'react';
import type { DirectoryQuery } from '@presight/shared';
import { directoryApi, appendCursor } from '../api/api-client';
import { directoryReducer, initialDirectoryState } from '../state/directory-state';

export function useDirectoryQuery(query: DirectoryQuery) {
  const [state, dispatch] = useReducer(directoryReducer, query, initialDirectoryState);
  const version = useRef(0);
  const appendController = useRef<AbortController | null>(null);

  useEffect(() => {
    const requestVersion = ++version.current;
    const controller = new AbortController();
    appendController.current?.abort();
    appendController.current = null;
    dispatch({ type: 'queryChanged', query });
    dispatch({ type: 'usersStarted', append: false });
    dispatch({ type: 'facetsStarted' });
    directoryApi.users(query, controller.signal).then((result) => {
      if (!controller.signal.aborted && requestVersion === version.current) dispatch({ type: 'usersSucceeded', ...result, append: false });
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted && requestVersion === version.current) dispatch({ type: 'usersFailed', message: reason instanceof Error ? reason.message : 'Unable to load users', append: false });
    });
    directoryApi.facets(query, controller.signal).then((facets) => {
      if (!controller.signal.aborted && requestVersion === version.current) dispatch({ type: 'facetsSucceeded', facets });
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted && requestVersion === version.current) dispatch({ type: 'facetsFailed', message: reason instanceof Error ? reason.message : 'Unable to load filters' });
    });
    return () => { controller.abort(); appendController.current?.abort(); appendController.current = null; };
  }, [query]);

  const loadMore = () => {
    if (!state.hasMore || !state.nextCursor || state.loading || state.loadingMore || appendController.current) return;
    const requestVersion = version.current;
    const controller = new AbortController();
    appendController.current = controller;
    dispatch({ type: 'usersStarted', append: true });
    directoryApi.users(appendCursor(query, state.nextCursor), controller.signal).then((result) => {
      if (requestVersion === version.current && appendController.current === controller) dispatch({ type: 'usersSucceeded', ...result, append: true });
    }).catch((reason: unknown) => {
      if (requestVersion === version.current && appendController.current === controller && !(reason instanceof DOMException && reason.name === 'AbortError')) dispatch({ type: 'usersFailed', message: reason instanceof Error ? reason.message : 'Unable to load more users', append: true });
    }).finally(() => {
      if (appendController.current === controller) appendController.current = null;
    });
  };

  const retryAppend = () => { if (!state.loadingMore) loadMore(); };

  return { ...state, loadMore, retryAppend };
}
