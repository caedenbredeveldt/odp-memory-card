// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import https from "node:https";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/superhero": {
        target: "https://www.superheroapi.com",
        changeOrigin: true,
        secure: true,
        // preserve /<TOKEN>/<ID>
        rewrite: (p) =>
          p.replace(
            /^\/superhero(\/.*)?$/,
            (_, rest = "") => `/api.php${rest}`
          ),
        // Reuse sockets and avoid opening too many at once
        agent: new https.Agent({ keepAlive: true, maxSockets: 8 }),
        // Give upstream a little breathing room
        timeout: 15000, // client->proxy timeout
        proxyTimeout: 15000, // proxy->upstream timeout
      },
    },
  },
});
