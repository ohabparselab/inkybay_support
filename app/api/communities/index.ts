import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { createNotification } from "~/lib/notification.server";
import { AddCommunitySchema } from "~/lib/validations";
import { getUserInfoById } from "~/lib/user.server";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

enum NotificationType {
    CHAT,
    TASK,
    COMMUNITY
}

const methodNotAllowed = () =>
    Response.json({ message: "Method Not Allowed" }, { status: 405 });

// MAIN HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase();
    switch (method) {
        case "POST":
            return await createCommunity(request);
        default:
            return methodNotAllowed();
    }
};

//
// [POST] Create a new Community Question
//
const createCommunity = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Parse & validate data
        const value = AddCommunitySchema.parse({
            ...data,
            listedDate: data.listedDate ? new Date(data.listedDate) : undefined,
        });

        // Build clean community data
        const communityData: any = {
            question: value.question,
            questionUrl: value.questionUrl,
            reply: value.reply || null,
            listedDate: value.listedDate ? new Date(value.listedDate) : null,
            createdBy: Number(userId),
        };

        if (value.addedById) {
            communityData.addedBy = { connect: { id: Number(value.addedById) } };
        }

        if (value?.statusId) {
            communityData.status = value.statusId ? { connect: { id: Number(value.statusId) } } : undefined;
        }
        if (value?.projectId) {
            communityData.project = value.projectId ? { connect: { id: Number(value.projectId) } } : undefined;

        }

        // Create Community record
        const community = await prisma.community.create({
            data: communityData,
            include: {
                project: true,
                status: true,
                addedBy: true,
            },
        });

        if (value.comments && value.comments.trim() !== "") {
            const comment = await prisma.comment.create({
                data: {
                    content: value.comments,
                    user: { connect: { id: userId } },
                    community: { connect: { id: community.id } },
                },
            });

            if (Array.isArray(value.mentions) && value.mentions.length > 0) {
                const validMentions = (value.mentions || []).filter(
                    (mId): mId is number => typeof mId === "number"
                );
                
                const actorUser = await getUserInfoById(userId);

                for (const mId of validMentions) {
                    await prisma.commentMention.create({
                        data: {
                            commentId: comment.id,
                            mentionedId: mId,
                        },
                    });

                    const notificationData: any = {
                        userId: mId,
                        actorId: userId,
                        type: NotificationType.COMMUNITY,
                        entityId: community.id,
                        title: `${actorUser.fullName} mentioned you a comment on community.`,
                        message: "You have a new mentioned comment in task please check",
                    };
                    await createNotification(notificationData);
                }
            }
        }

        // Log activity
        const logsParams = {
            userId,
            action: "CREATE" as ActivityAction,
            modelName: "community",
            recordId: community.id,
            metaData: { community },
        };

        await ActivityLog(logsParams);

        return Response.json({
            success: true,
            message: "Community question added successfully.",
            community,
        });
    } catch (error: any) {
        console.error("Create community failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
