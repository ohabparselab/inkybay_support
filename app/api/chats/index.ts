import { uploadFile } from "~/lib/upload.server"
import { prisma } from "~/lib/prisma.server"
import { getUserId } from "~/session.server"
import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server"
import { getUserInfoById } from "~/lib/user.server"
import { createNotification } from "~/lib/notification.server"

enum NotificationType {
    CHAT,
    TASK,
    COMMUNITY
}

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })

//  MAIN CONTROLLER HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase()
    switch (method) {
        case "GET":
            return await getAllChats(request)
        case "POST":
            return await createChat(request)
        default:
            return methodNotAllowed()
    }
}

//
// [GET] Fetch all chats
//
const getAllChats = async (_request: Request) => {
    try {
        const chats = await prisma.chat.findMany({});

        return Response.json({ success: true, chats })
    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })

    }
}

//
// [POST] Create new chats
//
const createChat = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        const formData = await request.formData();

        const clientId = formData.get("clientId") ? Number(formData.get("clientId")) : null;
        const clientQuery = formData.get("clientQuery")?.toString() || null;

        if (!clientQuery) {
            return Response.json({ success: false, message: "Client query is required." }, { status: 400 });
        }

        const comments = formData.get("comments")?.toString() || null;
        const mentions = formData.get("mentions")?.toString() || null;
        // --- CHAT DATA ---
        const chatData: any = {
            clientQuery: clientQuery,
            handleBy: formData.get("handleBy") ? Number(formData.get("handleBy")) : null,
            clientId: clientId,
            projectId: formData.get("projectId") ? Number(formData.get("projectId")) : null,
            chatDate: formData.get("chatDate") ? new Date(`${formData.get("chatDate")}T00:00:00.000Z`) : null,
            storefrontPassword: formData.get("storefrontPassword")?.toString() || null,
            externalChat: formData.get("externalChat") === "true",
            shopUrl: formData.get("shopUrl")?.toString() || null,
            shopName: formData.get("shopName")?.toString() || null,
            shopEmail: formData.get("shopEmail")?.toString() || null,
            clientFeedback: formData.get("clientFeedback")?.toString() || null,
            storeDetails: formData.get("storeDetails")?.toString() || null,
            otherStoresUrl: formData.get("otherStoresUrl")?.toString() || null,
            changesMadeByAgent: formData.get("changesMadeByAgent")?.toString() || null,
            agentRating: formData.get("agentRating") ? Number(formData.get("agentRating")) : null,
            createdBy: Number(userId),
        };

        // --- Handle Chat Transcript Upload ---
        const chatTranscriptFile = formData.get("chatTranscript") as File | null;
        if (chatTranscriptFile) {
            const chatTranscriptUrl = await uploadFile(chatTranscriptFile);
            if (chatTranscriptUrl) chatData.chatTranscript = chatTranscriptUrl;
        }

        // --- CREATE CHAT ---
        const chat = await prisma.chat.create({ data: chatData });

        if (comments && comments.trim() !== "") {
            const comment = await prisma.comment.create({
                data: {
                    content: comments,
                    user: { connect: { id: userId } },
                    chat: { connect: { id: chat.id } },
                },
            });

            if (Array.isArray(mentions) && mentions.length > 0) {
                const validMentions = (mentions || []).filter(
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
                        type: NotificationType.CHAT,
                        entityId: chat.id,
                        title: `${actorUser.fullName} mentioned you a comment on chat.`,
                        message: "You have a new mentioned comment in chat please check",
                    };

                    await createNotification(notificationData);
                }
            }
        }

        // --- REVIEW DATA ---
        const reviewData: any = {
            chatId: chat.id,
            reviewAsked: formData.get("reviewAsked") === "true",
            reviewStatus: formData.get("reviewStatus") === "true",
            reviewText: formData.get("reviewText")?.toString() || null,
            reviewNotAskReason: formData.get("reviewNotAskReason")?.toString() || null,
            rating: formData.get("rating") ? Number(formData.get("rating")) : null,
            ratingMood: formData.get("ratingMood")?.toString() || null,
            lastReviewApproach: formData.get("lastReviewApproach")
                ? new Date(formData.get("lastReviewApproach") as string)
                : null,
            reviewApproachBy: formData.get("reviewApproachBy")
                ? Number(formData.get("reviewApproachBy"))
                : null,
            reviewSubmittedAt: formData.get("reviewSubmittedAt")
                ? new Date(formData.get("reviewSubmittedAt") as string)
                : null,
            createdBy: Number(userId),
        };

        const review = await prisma.review.create({ data: reviewData });

        // --- FEATURE REQUEST
        const featureRequest = formData.get("featureRequest")?.toString() || null;
        if (featureRequest) {
            await prisma.featureRequest.create({
                data: {
                    clientId,
                    chatId: chat.id,
                    featureDetails: featureRequest,
                    createdBy: Number(userId),
                },
            });
        }

        // --- CLIENT EMAILS ---
        const clientEmails = formData.getAll("clientEmails[]").map((e) => e.toString());
        if (clientEmails.length > 0 && clientId) {
            for (const email of clientEmails) {
                const exists = await prisma.clientEmail.findUnique({
                    where: { clientId, email },
                });
                if (!exists) {
                    await prisma.clientEmail.create({ data: { clientId, email } });
                }
            }
        }

        // --- TAGS ---
        const tags = formData.getAll("tags[]").map((t) => t.toString().trim()).filter(Boolean);
        if (tags.length > 0) {
            for (const tagName of tags) {
                const tag = await prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName },
                });

                await prisma.chatTag.create({
                    data: {
                        chatId: chat.id,
                        tagId: tag.id,
                    },
                });
            }
        }

        const logsParams = {
            userId: userId,
            action: "CREATE" as ActivityAction,
            modelName: "chat",
            recordId: chat.id,
            metaData: {
                chatData: chat,
                reviewData: review,
                featureRequestData: featureRequest,
                tags: tags,
                clientEmails: clientEmails
            }
        }

        await ActivityLog(logsParams);

        return Response.json({
            success: true,
            message: "Chat and review created successfully.",
            chat,
        });
    } catch (error: any) {
        console.error("Create chat failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};



