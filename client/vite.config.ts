import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { env } from "./src/config/env";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": env.API_URL } },
});
