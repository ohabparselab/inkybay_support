import { NotificationType } from "@prisma/client";
import { prisma } from "./prisma.server";
import { io } from "../../server";
export interface CreateNotification {
    userId: number,
    actorId: number,
    type: NotificationType,
    title: string,
    message: string,
    entityId: number,
}

export async function createNotification(createParams: CreateNotification) {
    try {
        const notification = await prisma.notification.create({ data: createParams });
        console.log(`Notification created for user ${createParams.userId}`);

        // emit event directly (do not create new connection)
        io.emit(`user_${createParams.userId}_notification`, notification);
    } catch (error) {
        console.error("Create notification failed:", error);
    }
}


