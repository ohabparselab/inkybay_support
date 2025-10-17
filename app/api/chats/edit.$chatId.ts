import { prisma } from "~/lib/prisma.server";
import { uploadFile } from "~/lib/upload.server";

export async function action({ request, params }: { request: Request; params: any }) {

    const chatId = Number(params.chatId);
    if (!chatId) return new Response(JSON.stringify({ message: "Chat ID required" }), { status: 400 });

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateChat(chatId, request);
        case "DELETE":
            return await deleteChatHard(chatId);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

export const updateChat = async (chatId: number, request: Request) => {
    try {

        const formData = await request.formData();

        // Parse core fields
        const handleBy = formData.get("handleBy") ? Number(formData.get("handleBy")) : null;
        const clientQuery = formData.get("clientQuery")?.toString() || null;

        if (!handleBy) {
            return Response.json({ success: false, message: "Please select an agent (Handle By)." }, { status: 400 });
        }
        if (!clientQuery) {
            return Response.json({ success: false, message: "Client query is required." }, { status: 400 });
        }

        // Build chat data object
        const chatData: any = {
            clientQuery,
            chatDate: formData.get("chatDate") ? new Date(formData.get("chatDate") as string) : null,
            lastReviewApproach: formData.get("lastReviewApproach")
                ? new Date(formData.get("lastReviewApproach") as string)
                : null,
            reviewText: formData.get("reviewText")?.toString() || null,
            reviewAsked: formData.get("reviewAsked") === "true",
            reviewStatus: formData.get("reviewStatus") === "true",
            clientFeedback: formData.get("clientFeedback")?.toString() || null,
            storeDetails: formData.get("storeDetails")?.toString() || null,
            featureRequest: formData.get("featureRequest")?.toString() || null,
            agentRating: formData.get("agentRating") ? Number(formData.get("agentRating")) : null,
            agentComments: formData.get("agentComments")?.toString() || null,
            otherStoresUrl: formData.get("otherStoresUrl")?.toString() || null,
            changesMadeByAgent: formData.get("changesMadeByAgent")?.toString() || null,
        };

        // Handle file upload
        const chatTranscriptFile = formData.get("chatTranscript") as File | null;
        if (chatTranscriptFile && chatTranscriptFile.size > 0) {
            const chatTranscriptUrl = await uploadFile(chatTranscriptFile);
            if (chatTranscriptUrl) chatData.chatTranscript = chatTranscriptUrl;
        }

        // Update main chat record
        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: {
                ...chatData,
                handleByUser: { connect: { id: handleBy } },
            },
            include: { client: true },
        });

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

export const deleteChatHard = async (chatId: number) => {
    try {

        // Delete associated tags
        await prisma.chatTag.deleteMany({ where: { chatId } });

        // Delete chat itself
        await prisma.chat.delete({ where: { id: chatId } });

        return Response.json({ success: true, message: "Chat permanently deleted." });
    } catch (error: any) {
        console.error("Hard delete chat failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
