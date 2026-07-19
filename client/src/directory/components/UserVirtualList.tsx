import { List } from 'react-window';
import type { UserSummary } from '@presight/shared';
import { UserCard } from './UserCard';

export function UserVirtualList({ users, hasMore, loadingMore, appendError, onPrefetch, onRetry }: { users: UserSummary[]; hasMore: boolean; loadingMore: boolean; appendError: string | null; onPrefetch: () => void; onRetry: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);
  const rowCount = users.length + (hasMore ? 1 : 0);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateHeight = () => setHeight(Math.max(1, container.clientHeight));
    updateHeight();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  return <div className="directory-list">
    <div ref={containerRef} className="directory-list__viewport">
    <List
      defaultHeight={height}
      style={{ height }}
      overscanCount={4}
      rowCount={rowCount}
      rowHeight={112}
       rowProps={{ users, hasMore, loadingMore, appendError }}
       rowComponent={({ index, style, users: rows, hasMore: more, loadingMore: moreLoading, appendError: rowError }) => {
        if (index >= rows.length) return <div style={style} className="list-status" role={rowError ? 'alert' : 'status'} aria-live="polite">{rowError ? <><span>Could not load more people.</span><button type="button" onClick={onRetry}>Retry</button></> : moreLoading ? 'Loading more people...' : more ? 'Scroll to load more' : ''}</div>;
        return <div data-testid="virtual-row" style={style}><UserCard user={rows[index]} /></div>;
      }}
       onRowsRendered={({ stopIndex }) => { if (stopIndex >= users.length - 4) onPrefetch(); }}
    />
    </div>
  </div>;
}
import { useEffect, useRef, useState } from 'react';
