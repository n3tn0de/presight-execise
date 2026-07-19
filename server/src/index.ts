import { fileURLToPath } from "node:url";
import { createDatabaseApp } from "./app.js";
import { pool } from "./db/pool.js";

export function startServer(port = Number(process.env.PORT ?? 3000)) {
  const server = createDatabaseApp(pool).listen(port);

  async function shutdown() {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await pool.end();
  }

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer();
}
