import { type NotificationType } from "@prisma/client";
import { prisma } from "./prisma.server";
import { io } from "../../server";

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
        io.to(`user_${createParams.userId}`).emit("new_notification", notification);
    } catch (error) {
        console.error("Create notification failed:", error);
    }
}
