import express from "express";
import type { Pool } from "pg";
import { createFacetsRepository } from "./directory/facets-repository.js";
import { createDirectoryService } from "./directory/directory-service.js";
import { createUsersRepository } from "./directory/users-repository.js";
import type { FacetsResponse, DirectoryQuery, UsersResponse } from "@presight/shared";
import { errorMiddleware } from "./middleware/errors.js";
import { facetsRouter } from "./routes/facets.js";
import { healthRouter } from "./routes/health.js";
import { usersRouter } from "./routes/users.js";

export interface DirectoryService {
  list(query: DirectoryQuery): Promise<UsersResponse>;
  facets(query: DirectoryQuery): Promise<FacetsResponse>;
}

export interface AppDependencies {
  service: DirectoryService;
  healthCheck: () => Promise<void>;
}

export function createApp(dependencies: AppDependencies): express.Express {
  const app = express();
  app.use(express.json());
  app.use("/api/users", usersRouter(dependencies.service));
  app.use("/api/facets", facetsRouter(dependencies.service));
  app.use("/api/health", healthRouter(dependencies.healthCheck));
  app.use(errorMiddleware);
  return app;
}

export function createDatabaseApp(pool: Pool): express.Express {
  const service = createDirectoryService(createUsersRepository(pool), createFacetsRepository(pool));
  return createApp({ service, healthCheck: async () => { await pool.query("SELECT 1"); } });
}
