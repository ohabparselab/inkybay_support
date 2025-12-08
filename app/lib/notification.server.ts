import { prisma } from "./prisma.server";
// @ts-ignore
import { getUserSocket } from "../ws/userSockets.js";
import type { NotificationType } from "@prisma/client";

export interface CreateNotification {
    userId: number;
    actorId: number;
    type: NotificationType;
    title: string;
    message: string;
    entityId: number;
}

export async function createNotification(params: CreateNotification) {
    try {
        // 1️⃣ Save in DB
        const notification = await prisma.notification.create({
            data: params,
        });

        console.log("📝 Notification saved:", notification);

        // 2️⃣ Emit via WebSocket
        const socket = getUserSocket(params.userId);

        if (socket) {
            socket.emit("new_notification", notification);
            console.log(`📡 Notification pushed to user_${params.userId}`);
        } else {
            console.log(`⚠️ User ${params.userId} is offline, cannot send socket event.`);
        }

        return notification;
    } catch (error) {
        console.error("❌ Create notification failed:", error);
    }
}
