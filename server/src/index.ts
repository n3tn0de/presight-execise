import { fileURLToPath } from "node:url";
import { createDatabaseApp } from "./app/app";
import { env } from "./config/env";
import { pool } from "./db/pool/pool";

export function startServer(port = env.SERVER_PORT) {
  const server = createDatabaseApp(pool).listen(port, env.SERVER_HOST);

  async function shutdown() {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await pool.end();
  }

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer();
}
