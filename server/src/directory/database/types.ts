import type { DirectoryQuery } from "@presight/shared";

export interface BuiltQuery {
  text: string;
  values: unknown[];
}

export interface DirectoryCursor {
  sortValue: string | number;
  id: string;
}

export interface CursorPayload extends DirectoryCursor {
  signature: string;
  sortBy: DirectoryQuery["sortBy"];
  sortDir: DirectoryQuery["sortDir"];
}
