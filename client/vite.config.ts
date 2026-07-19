import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { config } from "@dotenvx/dotenvx";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { STRICT_MODE_FETCH_WARNING } from "./src/dev-warning";

export const environmentFilePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

config({ path: environmentFilePath });

export default defineConfig(({ mode }) => {
  if (mode === "development") console.warn(STRICT_MODE_FETCH_WARNING);

  return {
    plugins: [react()],
    server: { proxy: { "/api": { target: process.env.VITE_API_URL } } },
  };
});
