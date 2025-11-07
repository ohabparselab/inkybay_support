import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { prisma } from "~/lib/prisma.server";
import { uploadFile } from "~/lib/upload.server";
import { getUserId } from "~/session.server";

export async function action({ request, params }: { request: Request; params: any }) {

    const chatId = Number(params.chatId);
    if (!chatId) return new Response(JSON.stringify({ message: "Chat ID required" }), { status: 400 });

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateChat(chatId, request);
        case "DELETE":
            return await deleteChatHard(chatId, request);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

const updateChat = async (chatId: number, request: Request) => {
    try {

        const userId = await getUserId(request);
        const formData = await request.formData();

        // --- CHAT DATA ---
        const chatData: any = {
            clientQuery: formData.get("clientQuery")?.toString() || null,
            chatDate: formData.get("chatDate") ? new Date(formData.get("chatDate") as string) : null,
            storefrontPassword: formData.get("storefrontPassword")?.toString() || null,
            externalChat: formData.get("externalChat") === "true",
            shopUrl: formData.get("shopUrl")?.toString() || null,
            shopName: formData.get("shopName")?.toString() || null,
            shopEmail: formData.get("shopEmail")?.toString() || null,
            clientFeedback: formData.get("clientFeedback")?.toString() || null,
            storeDetails: formData.get("storeDetails")?.toString() || null,
            otherStoresUrl: formData.get("otherStoresUrl")?.toString() || null,
            changesMadeByAgent: formData.get("changesMadeByAgent")?.toString() || null,
            updatedBy: Number(userId),
            updatedAt: new Date(),
        };

        const handleBy = formData.get("handleBy") ? Number(formData.get("handleBy")) : null;
        const clientId = formData.get("clientId") ? Number(formData.get("clientId")) : null;
        const projectId =  formData.get("projectId") ? Number(formData.get("projectId")) : null;

        if (handleBy) {
            chatData.handleBy = handleBy;
        }

        if (clientId) {
            chatData.clientId = clientId;
        }

        if (projectId) {
            chatData.projectId = projectId;
        }

        // --- Handle Chat Transcript Upload ---
        const chatTranscriptFile = formData.get("chatTranscript") as File | null;
        if (chatTranscriptFile && chatTranscriptFile.size > 0) {
            const chatTranscriptUrl = await uploadFile(chatTranscriptFile);
            if (chatTranscriptUrl) chatData.chatTranscript = chatTranscriptUrl;
        }

        // --- UPDATE CHAT ---
        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: chatData,
        });

        // --- REVIEW DATA ---
        const reviewData: any = {
            reviewAsked: formData.get("reviewAsked") === "true",
            reviewStatus: formData.get("reviewStatus") === "true",
            reviewText: formData.get("reviewText")?.toString() || null,
            reviewNotAskReason: formData.get("reviewNotAskReason")?.toString() || null,
            agentRating: formData.get("agentRating") ? Number(formData.get("agentRating")) : null,
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
            updatedBy: Number(userId),
        };

        // upsert review — create if missing, update if exists
        const updatedReview = await prisma.review.upsert({
            where: { chatId },
            update: reviewData,
            create: { ...reviewData, chatId },
        });

        // --- FEATURE REQUEST ---
        const featureRequest = formData.get("featureRequest")?.toString() || null;
        if (featureRequest) {
            await prisma.featureRequest.upsert({
                where: { chatId },
                update: {
                    featureDetails: featureRequest,
                    updatedBy: Number(userId),
                    updatedAt: new Date(),
                },
                create: {
                    chatId,
                    clientId: updatedChat.clientId,
                    featureDetails: featureRequest,
                    createdBy: Number(userId),
                },
            });
        }
        // Sync client emails
        const clientEmails = formData.getAll("clientEmails[]").map((e) => e.toString().trim()).filter(Boolean);

        if (clientEmails.length > 0 && updatedChat.clientId) {
            // Fetch existing emails for the client
            const existingEmails = await prisma.clientEmail.findMany({
                where: { clientId: updatedChat.clientId },
            });

            const existingSet = new Set(existingEmails.map((e) => e.email));
            const newSet = new Set(clientEmails);

            // ➕ Add new emails
            for (const email of clientEmails) {
                if (!existingSet.has(email)) {
                    await prisma.clientEmail.create({
                        data: { clientId: updatedChat.clientId, email },
                    });
                }
            }

            // Hard delete removed emails
            for (const existing of existingEmails) {
                if (!newSet.has(existing.email)) {
                    await prisma.clientEmail.delete({
                        where: { id: existing.id },
                    });
                }
            }
        }


        // Sync tags
        const tags = formData.getAll("tags[]").map((t) => t.toString().trim()).filter(Boolean);

        if (tags.length > 0) {
            // Remove old chat tags first
            await prisma.chatTag.deleteMany({ where: { chatId } });

            // Recreate tags
            for (const tagName of tags) {
                const tag = await prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName },
                });

                await prisma.chatTag.create({
                    data: {
                        chatId,
                        tagId: tag.id,
                    },
                });
            }
        } else {
            // Remove all if no tags sent
            await prisma.chatTag.deleteMany({ where: { chatId } });
        }

        const logsParams = {
            userId: userId,
            action: "UPDATE" as ActivityAction,
            modelName: "chat",
            recordId: updatedChat.id,
            changes: {
                chatData: updatedChat,
                reviewData: updatedReview,
                featureRequestData: featureRequest,
                tags: tags,
                clientEmails: clientEmails
            }
        }

        await ActivityLog(logsParams);

        return Response.json({
            success: true,
            message: "Chat updated successfully.",
            chat: updatedChat,
        });
    } catch (error: any) {
        console.error("Update chat failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};

const deleteChatHard = async (chatId: number, request: Request) => {
    try {

        const userId = await getUserId(request);
        // Delete associated tags
        await prisma.chatTag.deleteMany({ where: { chatId } });

        // Delete chat itself
        await prisma.chat.delete({ where: { id: chatId } });

        const logsParams = {
            userId: userId,
            action: "DELETE" as ActivityAction,
            modelName: "chat",
            recordId: chatId,
            metadata: {
                chatId: chatId
            }

        }

        await ActivityLog(logsParams);

        return Response.json({ success: true, message: "Chat permanently deleted." });
    } catch (error: any) {
        console.error("Hard delete chat failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
