import { Router } from "express";

export function healthRouter(healthCheck: () => Promise<void>): Router {
  const router = Router();
  router.get("/", async (_request, response) => {
    await healthCheck();
    response.json({ status: "ok" });
  });
  return router;
}
