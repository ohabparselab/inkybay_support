import { NotificationType } from "@prisma/client";
import { prisma } from "./prisma.server";

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
        await prisma.notification.create({ data: createParams });
        // create the notification
    } catch (error) {
        console.error("Create notification failed:", error);
    }
}


