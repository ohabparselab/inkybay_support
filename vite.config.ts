import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";


const PORT = process.env.PARSETRACK_NODE_ENV == "production" ? process.env.PARSETRACK_LIVE_PORT : process.env.PARSETRACK_LIVE_PORT;
console.log("=======port=======>>", PORT);
export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
        port: Number(PORT) || 3000,
        allowedHosts: ["otelia-unbrightened-sully.ngrok-free.dev", "parsetrack.com"],
        hmr: { overlay: true },
    },
    build: {
        sourcemap: process.env.PARSETRACK_NODE_ENV !== "production",
    },
});
