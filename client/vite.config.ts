import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


import { config } from '@dotenvx/dotenvx'
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export const environmentFilePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

config({ path: environmentFilePath });

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": {target: process.env.VITE_API_URL} } },
});
