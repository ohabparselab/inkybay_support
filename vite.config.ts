import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
        port: Number(process.env.PORT) || 3000,
        allowedHosts: ["otelia-unbrightened-sully.ngrok-free.dev"],
        hmr: { overlay: true },
    },
    build: {
        sourcemap: process.env.NODE_ENV !== "production",
    },
});
