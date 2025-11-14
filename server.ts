import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@react-router/express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProd = process.env.NODE_ENV === "production";

const app = express();
const httpServer = createServer(app);

// --- SOCKET.IO SETUP ---
export const io = new Server(httpServer, {
    cors: {
        origin: "*", // adjust this for security
    },
});

// Handle socket connections
io.on("connection", (socket:any) => {
    // from this point you are on the WS connection with a specific client
    console.log(socket.id, "connected");

    // socket.emit("confirmation", "connected!");

    // socket.on("event", (data) => {
    //     console.log(socket.id, data);
    //     socket.emit("event", "pong");
    // });
    socket.on("join_room", (room:any) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined ${room}`);
    });
});

// --- MIDDLEWARE ---
app.use(compression());
app.use(morgan("tiny"));
app.disable("x-powered-by");

// --- FRONTEND HANDLER ---
let remixHandler;
console.log('=======env====', isProd);
if (!isProd) {
    // DEV MODE: use Vite middleware for live reload
    const vite = await import("vite");
    const viteDevServer = await vite.createServer({
        server: { middlewareMode: true },
    });
    app.use(viteDevServer.middlewares);

    remixHandler = createRequestHandler({
        // @ts-ignore
        build: () => viteDevServer.ssrLoadModule("virtual:react-router/server-build"),
    });
} else {
    // PROD MODE: use built files
    app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" })
    );
    app.use(express.static("build/client", { maxAge: "1h" }));

    // remixHandler = createRequestHandler({
    //     // @ts-ignore
    //     build: await import("./build/server/index.js"),
    // });
}

// app.all("*", remixHandler);

const port = process.env.PORT || 3000;

const shutdown = () => {
    console.log("Shutting down server...");
    io.close(); // close Socket.IO
    httpServer.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

if (!(globalThis as any).__serverStarted) {
    httpServer.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
    (globalThis as any).__serverStarted = true;
}