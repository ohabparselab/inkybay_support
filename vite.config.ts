import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const port =
    process.env.PARSETRACK_NODE_ENV === "beta"
        ? process.env.PARSETRACK_BETA_PORT
        : process.env.PARSETRACK_LIVE_PORT;

const serverPort = Number(port) || 5001; // fallback if undefined

console.log("=======port=======>>", serverPort);

export default defineConfig({
    server: {
        port: serverPort,
        allowedHosts: ["otelia-unbrightened-sully.ngrok-free.dev", "parsetrack.com"],
        hmr: { overlay: true },
    },
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
        sourcemap: process.env.PARSETRACK_NODE_ENV !== "production",
    },
});

