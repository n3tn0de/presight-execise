import { Router } from "express";
import { parseApiQuery } from "../../query";
import type { DirectoryService } from "../../app/types";

export function usersRouter(service: DirectoryService): Router {
  const router = Router();
  router.get("/", async (request, response) => {
    response.json(await service.list(parseApiQuery(request.query as Record<string, unknown>)));
  });
  return router;
}
