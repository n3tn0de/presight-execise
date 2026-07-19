import express from "express";
import type { Pool } from "pg";
import { createFacetsRepository } from "../directory/repositories/facets-repository";
import { createDirectoryService } from "../directory/service/directory-service";
import { createUsersRepository } from "../directory/repositories/users-repository";
import { errorMiddleware } from "../middleware/errors";
import { facetsRouter } from "../routes/facets";
import { healthRouter } from "../routes/health";
import { usersRouter } from "../routes/users/users";
import type { AppDependencies } from "./types";

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
  const service = createDirectoryService(
    createUsersRepository(pool),
    createFacetsRepository(pool),
  );
  return createApp({
    service,
    healthCheck: async () => {
      await pool.query("SELECT 1");
    },
  });
}
