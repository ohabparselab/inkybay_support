import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// import attachIoMiddleware from "./app/middleware/attachIo";
// import apiRouter from "./app/routes/api";

// ---------------- Express + Remix Setup ----------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const httpServer = createServer(app);

// ---------------- SOCKET.IO SETUP ----------------
export const io = new Server(httpServer, {
    cors: { origin: "*" }
});

// WS logic
// @ts-ignore
import wsConfig from "./app/ws/ws.js";
wsConfig(io);

// ---------------- MIDDLEWARE ----------------
app.use(morgan("tiny"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable("x-powered-by");

// app.use(attachIoMiddleware);

// ---------------- REMIX HANDLER ----------------
const isProd = process.env.NODE_ENV === "production";

let remixHandler;

if (!isProd) {
    const vite = await import("vite");
    const viteDevServer = await vite.createServer({
        server: { middlewareMode: true }
    });
    app.use(viteDevServer.middlewares);

    remixHandler = (await import("@react-router/express")).createRequestHandler({
        // @ts-ignore
        build: () =>
            viteDevServer.ssrLoadModule("virtual:react-router/server-build")
    });
} else {
    app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" })
    );
    app.use(express.static("build/client", { maxAge: "1h" }));

    remixHandler = (await import("@react-router/express")).createRequestHandler({
        // @ts-ignore
        build: await import("./build/server/index.js")
    });
}

// app.use("/api", apiRouter);

// Remix last
app.all("*", remixHandler);

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running http://localhost:${PORT}`);
});
