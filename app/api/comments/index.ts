import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { createNotification } from "~/lib/notification.server";
import { getCommunityInfoById } from "~/lib/community.server";
import { getCommentInfoById } from "~/lib/comment.server";
import { addCommentSchema } from "~/lib/validations";
import { getUserInfoById } from "~/lib/user.server";
import { getTaskInfoById } from "~/lib/task.server";
import { getChatInfoById } from "~/lib/chat.server";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

enum NotificationType {
    CHAT,
    TASK,
    COMMUNITY
}

export async function loader({ request }: { request: Request }) {
    try {
        const url = new URL(request.url);
        const contextType = url.searchParams.get("type");
        const contextId = url.searchParams.get("id");
        const threadId = url.searchParams.get("threadId");

        // Case 1: Load replies for one parent
        if (threadId) {
            const replies = await prisma.comment.findMany({
                where: { parentId: Number(threadId) },
                orderBy: { createdAt: "asc" },
                include: {
                    user: { select: { id: true, fullName: true, avatar: true } },
                },
            });
            return Response.json({ success: true, replies });
        }

        // Case 2: Load top-level comments only
        if (!contextType || !contextId) {
            return Response.json({ success: false, message: "Missing type or id" }, { status: 400 });
        }

        const where: any = { parentId: null };
        if (contextType === "community") where.communityId = Number(contextId);
        if (contextType === "task") where.taskId = Number(contextId);
        if (contextType === "chat") where.chatId = Number(contextId);

        const comments = await prisma.comment.findMany({
            where,
            orderBy: { createdAt: "asc" },
            include: {
                user: { select: { id: true, fullName: true, avatar: true } },
                _count: { select: { replies: true } },
            },
        });

        return Response.json({ success: true, comments });
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 });

export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase();
    switch (method) {
        case "POST":
            return await createComment(request);
        default:
            return methodNotAllowed();
    }
};

// [POST] Create new comment
const createComment = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Parse & validate input
        const value = addCommentSchema.parse(data);

        // Build comment data
        const commentData: any = {
            content: value.content,
            user: { connect: { id: userId } },
        };

        if (value.parentId) {
            commentData.parent = { connect: { id: Number(value.parentId) } }
        }

        if (value.chatId) {
            commentData.chat = { connect: { id: Number(value.chatId) } }
        }

        if (value.taskId) {
            commentData.task = { connect: { id: Number(value.taskId) } }
        }

        if (value.communityId) {
            commentData.community = { connect: { id: Number(value.communityId) } }
        }

        // Create comment
        const comment = await prisma.comment.create({
            data: commentData,
            include: { user: true, replies: true, mentions: true },
        });

        if (value.chatId) {

            const actorUser = await getUserInfoById(userId);

            const notificationData: any = {
                actorId: userId,
                type: NotificationType.CHAT,
                entityId: value.chatId,
                isRead: false,
            };

            if (!value.parentId) {
                const chatInfo = await getChatInfoById(value.chatId);
                if (chatInfo?.createdBy !== userId) {
                    notificationData.userId = chatInfo.createdBy;
                    notificationData.title = `${actorUser.fullName} commented on your chat.`;
                    notificationData.message = "You have a new comment in your chat, please check.";
                    await createNotification(notificationData);
                }
            } else {
                const commentInfo = await getCommentInfoById(value.parentId);
                if (commentInfo?.userId !== userId) {
                    notificationData.userId = commentInfo.userId;
                    notificationData.title = `${actorUser.fullName} replied to your comment in a chat.`;
                    notificationData.message = "You have a new reply in your chat comment, please check.";
                    await createNotification(notificationData);
                }
            }
        }

        // Handle Task comment notifications
        if (value.taskId) {
            const actorUser = await getUserInfoById(userId);

            const notificationData: any = {
                actorId: userId,
                type: NotificationType.TASK,
                entityId: value.taskId,
                isRead: false,
            };

            if (!value.parentId) {
                const taskInfo = await getTaskInfoById(value.taskId);
                if (taskInfo?.createdBy !== userId) {
                    notificationData.userId = taskInfo.createdBy;
                    notificationData.title = `${actorUser.fullName} commented on your task.`;
                    notificationData.message = "You have a new comment in your task. Please check.";

                    await createNotification(notificationData);
                }
            } else {
                const commentInfo = await getCommentInfoById(value.parentId);
                if (commentInfo?.userId !== userId) {
                    notificationData.userId = commentInfo.userId;
                    notificationData.title = `${actorUser.fullName} replied to your comment in a task.`;
                    notificationData.message = "You have a new reply in your task comment. Please check.";
                    await createNotification(notificationData);
                }
            }
        }

        // Handle Community comment notifications
        if (value.communityId) {
            const actorUser = await getUserInfoById(userId);

            const notificationData: any = {
                actorId: userId,
                type: NotificationType.COMMUNITY,
                entityId: value.communityId,
                isRead: false,
            };

            if (!value.parentId) {
                const communityInfo = await getCommunityInfoById(value.communityId);
                if (communityInfo?.createdBy !== userId) {
                    notificationData.userId = communityInfo.createdBy;
                    notificationData.title = `${actorUser.fullName} commented on your community post.`;
                    notificationData.message = "You have a new comment in your community post. Please check.";
                    await createNotification(notificationData);
                }
            } else {
                const commentInfo = await getCommentInfoById(value.parentId);
                if (commentInfo?.userId !== userId) {
                    notificationData.userId = commentInfo.userId;
                    notificationData.title = `${actorUser.fullName} replied to your comment in a community post.`;
                    notificationData.message = "You have a new reply in your community post comment. Please check.";
                    await createNotification(notificationData);
                }
            }
        }



        // Handle mentions
        if (value.mentions && value.mentions.length > 0) {
            for (const mentionedId of value.mentions) {

                await prisma.commentMention.create({
                    data: { commentId: comment.id, mentionedId },
                });

                const notificationData: any = {
                    userId: mentionedId,
                    actorId: userId,
                };

                const actorUser = await getUserInfoById(userId);

                // detect entity and set type + entityId
                if (value.chatId) {
                    notificationData.type = NotificationType.CHAT;
                    notificationData.entityId = Number(value.chatId);
                    notificationData.title = `${actorUser.fullName} mentioned you a comment on chat.`;
                    notificationData.message = "You have a new mentioned comment in chat please check";
                } else if (value.taskId) {
                    notificationData.type = NotificationType.TASK;
                    notificationData.entityId = Number(value.taskId);
                    notificationData.title = `${actorUser.fullName} mentioned you a comment on task.`;
                    notificationData.message = "You have a new mentioned comment in task please check";
                } else if (value.communityId) {
                    notificationData.type = NotificationType.COMMUNITY;
                    notificationData.entityId = Number(value.communityId);
                    notificationData.title = `${actorUser.fullName} mentioned you a comment on community.`;
                    notificationData.message = "You have a new mentioned comment in task please check";
                }
                await createNotification(notificationData);
            }
        }

        // Log activity
        await ActivityLog({
            userId,
            action: "CREATE" as ActivityAction,
            modelName: "comment",
            recordId: comment.id,
            metadata: { comment },
        });

        return Response.json({
            success: true,
            message: "Comment added successfully.",
            comment,
        });
    } catch (error: any) {
        console.error("Create comment failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
