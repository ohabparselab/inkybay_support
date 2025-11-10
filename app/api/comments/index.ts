import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { createNotification } from "~/lib/notification.server";
import { addCommentSchema } from "~/lib/validations";
import { NotificationType } from "@prisma/client";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

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

        // Handle mentions
        if (value.mentions && value.mentions.length > 0) {
            for (const mentionedId of value.mentions) {

                await prisma.commentMention.create({
                    data: { commentId: comment.id, mentionedId },
                });

                const notificationData:any = {
                    userId: mentionedId,
                    actorId: userId,
                };
                
                // detect entity and set type + entityId
                if (value.chatId) {
                    notificationData.type = NotificationType.CHAT;
                    notificationData.entityId = Number(value.chatId);
                } else if (value.taskId) {
                    notificationData.type = NotificationType.TASK;
                    notificationData.entityId = Number(value.taskId);
                } else if (value.communityId) {
                    notificationData.type = NotificationType.COMMUNITY;
                    notificationData.entityId = Number(value.communityId);
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
