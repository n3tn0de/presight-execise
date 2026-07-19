import type { DirectoryQuery, FacetsResponse, UsersResponse } from "@presight/shared";

export interface DirectoryService {
  list(query: DirectoryQuery): Promise<UsersResponse>;
  facets(query: DirectoryQuery): Promise<FacetsResponse>;
}

export interface AppDependencies {
  service: DirectoryService;
  healthCheck: () => Promise<void>;
}
