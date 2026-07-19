import { Router } from "express";
import { parseApiQuery } from "../query";
import type { DirectoryService } from "../app/types";

export function facetsRouter(service: DirectoryService): Router {
  const router = Router();
  router.get("/", async (request, response) => {
    response.json(await service.facets(parseApiQuery(request.query as Record<string, unknown>)));
  });
  return router;
}
