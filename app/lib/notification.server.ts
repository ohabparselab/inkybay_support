import { type NotificationType } from "@prisma/client";
import { prisma } from "./prisma.server";
import { getIO } from "./socket.server";
import { sendNotificationToUser } from "server";

export interface CreateNotification {
    userId: number;
    actorId: number;
    type: NotificationType;
    title: string;
    message: string;
    entityId: number;
}

export async function createNotification(createParams: CreateNotification) {
    try {
        const notification = await prisma.notification.create({ data: createParams });
        console.log(`📡 Sent user_${createParams.userId}`, notification);
        try {
           sendNotificationToUser(createParams.userId, createParams)
        } catch (err) {
            console.error("❌ Socket emit failed:", err);
        }

    } catch (error) {
        console.error("Create notification failed:", error);
    }
}
