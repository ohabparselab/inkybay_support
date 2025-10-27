import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const port =
  process.env.PARSETRACK_NODE_ENV === "beta"
    ? Number(process.env.PARSETRACK_BETA_PORT)
    : process.env.PARSETRACK_NODE_ENV === "production"
    ? Number(process.env.PARSETRACK_LIVE_PORT)
    : 3000;

export default defineConfig({
    server: {
        port: port,
        allowedHosts: ["otelia-unbrightened-sully.ngrok-free.dev", "parsetrack.com"],
        hmr: { overlay: true },
    },
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
        sourcemap: process.env.PARSETRACK_NODE_ENV !== "production",
    },
});

