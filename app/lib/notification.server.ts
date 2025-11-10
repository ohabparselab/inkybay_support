import { NotificationType } from "@prisma/client";
import { prisma } from "./prisma.server";
import { getUserInfoById } from "./user.server";

export interface CreateNotification {
    userId: number,
    actorId: number,
    type: NotificationType,
    entityId: number,
}

export async function createNotification(createParams: CreateNotification) {

    try {
        const { userId, actorId, type, entityId } = createParams;

        const actorUser = await getUserInfoById(userId);

        const notificationData: any = {
            userId: userId,
            actorId: actorId,
            entityId: entityId,
            isRead: false,
        };

        if (type == NotificationType.CHAT) {
            notificationData.type = NotificationType.CHAT;
            notificationData.title = `${actorUser.fullName} mentioned you a comment on chat.`;
            notificationData.message = "You have a new mentioned comment in chat please check";
        }

        if (type == NotificationType.TASK) {
            notificationData.type = NotificationType.TASK;
            notificationData.title = `${actorUser.fullName} mentioned you a comment on task.`;
            notificationData.message = "You have a new mentioned comment in task please check";
        }

        if (type == NotificationType.COMMUNITY) {
            notificationData.type = NotificationType.COMMUNITY;
            notificationData.title = `${actorUser.fullName} mentioned you a comment on community.`;
            notificationData.message = "You have a new mentioned comment in task please check";
        }

        if (notificationData.type && notificationData.entityId) {
            await prisma.notification.create({ data: notificationData });
        }

        // create the notification
    } catch (error) {
        console.error("Create comment failed:", error);
    }
}


