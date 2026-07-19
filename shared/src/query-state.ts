import type { DirectoryQuery, SortDirection, SortField } from './api';

export const MIN_DIRECTORY_LIMIT = 1;
export const MAX_DIRECTORY_LIMIT = 100;

export const DEFAULT_DIRECTORY_QUERY: DirectoryQuery = {
  q: '',
  nationality: [],
  hobby: [],
  sortBy: 'first_name',
  sortDir: 'asc',
  limit: 20,
};

const SORT_FIELDS: readonly SortField[] = ['first_name', 'last_name', 'age', 'nationality'];

function normalizeValues(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
}

function parseLimit(value: string | null): number {
  if (value === null || !/^\d+$/.test(value)) return DEFAULT_DIRECTORY_QUERY.limit;
  return Math.min(MAX_DIRECTORY_LIMIT, Math.max(MIN_DIRECTORY_LIMIT, Number(value)));
}

function normalizeLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_DIRECTORY_QUERY.limit;
  return Math.min(MAX_DIRECTORY_LIMIT, Math.max(MIN_DIRECTORY_LIMIT, Math.trunc(value)));
}

export function parseDirectoryQuery(input: string | URLSearchParams): DirectoryQuery {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const sortBy = params.get('sortBy');
  const sortDir = params.get('sortDir');
  const q = params.get('q')?.trim() ?? '';

  return {
    q,
    nationality: normalizeValues(params.getAll('nationality')),
    hobby: normalizeValues(params.getAll('hobby')),
    sortBy: SORT_FIELDS.includes(sortBy as SortField)
      ? (sortBy as SortField)
      : DEFAULT_DIRECTORY_QUERY.sortBy,
    sortDir: sortDir === 'desc' || sortDir === 'asc' ? (sortDir as SortDirection) : DEFAULT_DIRECTORY_QUERY.sortDir,
    limit: parseLimit(params.get('limit')),
  };
}

export function serializeDirectoryQuery(query: DirectoryQuery): string {
  const params = new URLSearchParams();
  const nationality = normalizeValues(query.nationality);
  const hobby = normalizeValues(query.hobby);

  hobby.forEach((value) => params.append('hobby', value));
  nationality.forEach((value) => params.append('nationality', value));
  if (query.q.trim()) params.set('q', query.q.trim());
  const sortBy = SORT_FIELDS.includes(query.sortBy) ? query.sortBy : DEFAULT_DIRECTORY_QUERY.sortBy;
  const sortDir = query.sortDir === 'desc' || query.sortDir === 'asc'
    ? query.sortDir
    : DEFAULT_DIRECTORY_QUERY.sortDir;
  const limit = normalizeLimit(query.limit);
  if (sortBy !== DEFAULT_DIRECTORY_QUERY.sortBy) params.set('sortBy', sortBy);
  if (sortDir !== DEFAULT_DIRECTORY_QUERY.sortDir) params.set('sortDir', sortDir);
  if (limit !== DEFAULT_DIRECTORY_QUERY.limit) params.set('limit', String(limit));

  return params.toString();
}
