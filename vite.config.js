// // vite.config.js
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// // import fetch from "node-fetch";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/superhero": {
//         target: "https://superheroapi.com",
//         changeOrigin: true,
//         rewrite: (p) => p.replace(/^\/superhero/, "/api"),
//         configure: (proxy) => {
//           proxy.on("proxyRes", async (proxyRes, req, res) => {
//             if (proxyRes.statusCode === 302 && proxyRes.headers.location) {
//               // Stop forwarding the redirect to the browser:
//               proxyRes.destroy(); // abort piping

//               try {
//                 const r = await fetch(proxyRes.headers.location, {
//                   redirect: "follow",
//                 });
//                 const text = await r.text();
//                 res.setHeader(
//                   "Content-Type",
//                   r.headers.get("content-type") || "application/json"
//                 );
//                 res.setHeader("Cache-Control", "public, max-age=300");
//                 // Since the browser sees this as same-origin, no CORS header needed.
//                 res.statusCode = r.status;
//                 res.end(text);
//               } catch (e) {
//                 res.statusCode = 502;
//                 res.end(JSON.stringify({ error: "Upstream follow failed" }));
//               }
//             }
//           });
//         },
//       },
//     },
//   },
// });

// vite.config.js
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/superhero": {
//         target: "https://www.superheroapi.com",
//         changeOrigin: true,
//         // Go directly to /api.php to avoid the 302
//         rewrite: (p) => p.replace(/^\/superhero/, "/api.php"),
//         // IMPORTANT: remove the custom redirect-following code
//         // No `configure` block needed
//       },
//     },
//   },
// });

// vite.config.js
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       // Browser calls:  /superhero/<TOKEN>/<ID>
//       "/superhero": {
//         target: "https://www.superheroapi.com", // NOTE: include www
//         changeOrigin: true,
//         secure: true, // keep TLS verification on (default); set to false only if needed
//         // Carefully rewrite to /api.php/<TOKEN>/<ID>
//         rewrite: (path) =>
//           path.replace(
//             /^\/superhero(\/.*)?$/,
//             (_m, rest = "") => `/api.php${rest}`
//           ),
//         configure(proxy) {
//           // Add visibility without touching the body/flow
//           proxy.on("proxyReq", (proxyReq, req) => {
//             console.log(
//               "[proxyReq]",
//               req.method,
//               proxyReq.protocol + "//" + proxyReq.host + proxyReq.path
//             );
//           });
//           proxy.on("proxyRes", async (proxyRes, req) => {
//             const chunks = [];
//             proxyRes.on("data", (c) => chunks.push(c));
//             proxyRes.on("end", () => {
//               const body = Buffer.concat(chunks).toString();
//               if ((proxyRes.statusCode ?? 0) >= 400) {
//                 console.error(
//                   "[proxyRes ERROR]",
//                   proxyRes.statusCode,
//                   req.url,
//                   "\n",
//                   body.slice(0, 400)
//                 );
//               } else {
//                 console.log("[proxyRes]", proxyRes.statusCode, req.url);
//               }
//             });
//           });
//           proxy.on("error", (err, req) => {
//             console.error("[proxy ERROR]", req?.url, err?.message);
//           });
//         },
//       },
//     },
//   },
// });

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
