import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // Forward cookies correctly between proxy and backend
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            // Remove SameSite=Strict in dev so cookie works across ports
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              proxyRes.headers["set-cookie"] = (
                Array.isArray(cookies) ? cookies : [cookies]
              ).map((c) => c.replace(/SameSite=Strict/gi, "SameSite=Lax"));
            }
          });
        },
      },
      "/ws": {
        target: "ws://localhost:3000",
        ws: true,
      },
    },
  },
});
