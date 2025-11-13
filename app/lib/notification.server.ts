import pkg from "@prisma/client";
import { prisma } from "./prisma.server";

const { $Enums } = pkg;

export type NotificationType = (typeof $Enums.NotificationType)[keyof typeof $Enums.NotificationType];

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
    console.log(`📡 Sent user_${createParams.userId}_notification`);
  } catch (error) {
    console.error("Create notification failed:", error);
  }
}
