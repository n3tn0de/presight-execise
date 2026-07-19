import type {
  DirectoryQuery,
  SortDirection,
  SortField,
} from "@presight/shared";

const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

const sortFields: readonly SortField[] = [
  "first_name",
  "last_name",
  "age",
  "nationality",
];

function values(input: string[] | undefined): string[] {
  return [
    ...new Set((input ?? []).map((value) => value.trim()).filter(Boolean)),
  ].sort();
}

export function parseDirectoryQuery(
  input: Partial<DirectoryQuery>,
): DirectoryQuery {
  const limit = Number.isFinite(input.limit)
    ? Math.trunc(input.limit as number)
    : DEFAULT_LIMIT;
  return {
    q: input.q?.trim() ?? "",
    nationality: values(input.nationality),
    hobby: values(input.hobby),
    sortBy: sortFields.includes(input.sortBy as SortField)
      ? (input.sortBy as SortField)
      : "first_name",
    sortDir:
      input.sortDir === "desc" || input.sortDir === "asc"
        ? (input.sortDir as SortDirection)
        : "asc",
    limit: Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, limit)),
  };
}
