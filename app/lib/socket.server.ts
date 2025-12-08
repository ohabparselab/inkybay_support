// app/lib/socket.server.ts
import { Server } from "socket.io";

let ioInstance: Server | null = null;

/**
 * Initialize Socket.IO with the HTTP server
 */
export function initIO(server: any) {
    if (ioInstance) {
        console.log("⚠️ Socket.io already initialized — reusing existing instance.");
        return ioInstance;
    }

    ioInstance = new Server(server, {
        cors: { origin: "*" }
    });

    console.log("🚀 Socket.io initialized!");
    return ioInstance;
}


/**
 * Get the already initialized IO instance
 */
export function getIO(server?: any): Server {
    if (!ioInstance) {
        if (!server) throw new Error("Socket.io not initialized and no server provided!");
        ioInstance = new Server(server, { cors: { origin: "*" } });
        console.log("⚠️ Socket.io auto-initialized inside getIO()");
    }
    return ioInstance;
}

