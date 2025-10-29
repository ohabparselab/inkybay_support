import { uploadFile } from "~/lib/upload.server"
import { prisma } from "~/lib/prisma.server"
import { getUserId } from "~/session.server"

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

// const createChat = async (request: Request) => {
//     try {
//         const formData = await request.formData();

//         // Parse basic fields
//         const clientId = formData.get("clientId") ? Number(formData.get("clientId")) : null;
//         const handleBy = formData.get("handleBy") ? Number(formData.get("handleBy")) : null;
//         const clientQuery = formData.get("clientQuery")?.toString() || null;

//         if (!clientId) {
//             return Response.json({ success: false, message: "Please select a client." }, { status: 400 });
//         }
//         if (!handleBy) {
//             return Response.json({ success: false, message: "Please select an agent (Handle By)." }, { status: 400 });
//         }
//         if (!clientQuery) {
//             return Response.json({ success: false, message: "Client query is required." }, { status: 400 });
//         }

//         // Build chat data
//         const chatData: any = {
//             clientQuery,
//             chatDate: formData.get("chatDate") ? new Date(formData.get("chatDate") as string) : null,
//             lastReviewApproach: formData.get("lastReviewApproach")
//                 ? new Date(formData.get("lastReviewApproach") as string)
//                 : null,
//             reviewText: formData.get("reviewText")?.toString() || null,
//             reviewAsked: formData.get("reviewAsked") === "true",
//             reviewStatus: formData.get("reviewStatus") === "true",
//             clientFeedback: formData.get("clientFeedback")?.toString() || null,
//             storeDetails: formData.get("storeDetails")?.toString() || null,
//             featureRequest: formData.get("featureRequest")?.toString() || null,
//             agentRating: formData.get("agentRating") ? Number(formData.get("agentRating")) : null,
//             agentComments: formData.get("agentComments")?.toString() || null,
//             otherStoresUrl: formData.get("otherStoresUrl")?.toString() || null,
//             changesMadeByAgent: formData.get("changesMadeByAgent")?.toString() || null,
//         };

//         // Handle file upload
//         const chatTranscriptFile = formData.get("chatTranscript") as File | null;
//         if (chatTranscriptFile) {
//             const chatTranscriptUrl = await uploadFile(chatTranscriptFile);
//             if (chatTranscriptUrl) chatData.chatTranscript = chatTranscriptUrl;
//         }

//         // Insert client emails
//         const clientEmails = formData.getAll("clientEmails[]").map(email => email.toString());
//         if (clientEmails.length > 0) {
//             for (const email of clientEmails) {
//                 const exists = await prisma.clientEmail.findUnique({
//                     where: { clientId, email },
//                 });
//                 if (!exists) {
//                     await prisma.clientEmail.create({
//                         data: { clientId, email },
//                     });
//                 }
//             }
//         }

//         // Create chat with relations
//         const chat = await prisma.chat.create({
//             data: {
//                 ...chatData,
//                 handleByUser: { connect: { id: handleBy } },
//                 client: { connect: { id: clientId } },
//             },
//         });

//         // Handle Tags (formData: tags[])
//         const tags = formData.getAll("tags[]").map(t => t.toString().trim()).filter(Boolean);

//         if (tags.length > 0) {
//             for (const tagName of tags) {
//                 const tag = await prisma.tag.upsert({
//                     where: { name: tagName },
//                     update: {},
//                     create: { name: tagName },
//                 });

//                 await prisma.chatTag.create({
//                     data: {
//                         chatId: chat.id,
//                         tagId: tag.id,
//                     },
//                 });
//             }
//         }

//         return Response.json({ success: true, message: "Chat created successfully.", chat });
//     } catch (error: any) {
//         console.error("Create chat failed:", error);
//         return Response.json({ success: false, message: error.message }, { status: 500 });
//     }
// };

const createChat = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        const formData = await request.formData();

        const clientId = formData.get("clientId") ? Number(formData.get("clientId")) : null;
        const clientQuery = formData.get("clientQuery")?.toString() || null;

        if (!clientQuery) {
            return Response.json({ success: false, message: "Client query is required." }, { status: 400 });
        }

        // --- CHAT DATA ---
        const chatData: any = {
            clientQuery: clientQuery,
            handleBy: formData.get("handleBy") ? Number(formData.get("handleBy")) : null,
            clientId: clientId,
            projectId: formData.get("projectId") ? Number(formData.get("projectId")) : null,
            chatDate: formData.get("chatDate") ? new Date(formData.get("chatDate") as string) : null,
            storefrontPassword: formData.get("storefrontPassword")?.toString() || null,
            externalChat: formData.get("externalChat") === "true",
            shopUrl: formData.get("shopUrl")?.toString() || null,
            shopName: formData.get("shopName")?.toString() || null,
            shopEmail: formData.get("shopEmail")?.toString() || null,
            clientFeedback: formData.get("clientFeedback")?.toString() || null,
            storeDetails: formData.get("storeDetails")?.toString() || null,
            agentComments: formData.get("agentComments")?.toString() || null,
            otherStoresUrl: formData.get("otherStoresUrl")?.toString() || null,
            changesMadeByAgent: formData.get("changesMadeByAgent")?.toString() || null,
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

        // --- REVIEW DATA ---
        const reviewData: any = {
            chatId: chat.id,
            reviewAsked: formData.get("reviewAsked") === "true" || null,
            reviewStatus: formData.get("reviewStatus") === "true" || null,
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
        };

        await prisma.review.create({ data: reviewData });

        // --- FEATURE REQUEST
        const featureRequest = formData.get("featureRequest")?.toString() || null;
        if (featureRequest && clientId) {
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



