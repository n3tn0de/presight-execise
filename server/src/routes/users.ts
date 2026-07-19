import { Router } from "express";
import { parseApiQuery } from "../query.js";
import type { DirectoryService } from "../app.js";

export function usersRouter(service: DirectoryService): Router {
  const router = Router();
  router.get("/", async (request, response) => {
    response.json(await service.list(parseApiQuery(request.query as Record<string, unknown>)));
  });
  return router;
}
