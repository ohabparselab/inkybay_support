import { addChatSchema, changePasswordSchema, createUserSchema } from "~/lib/validations"
import type { LoaderFunctionArgs } from "react-router"
import { uploadFile } from "~/lib/upload.server"
import { getUserId } from "~/session.server"
import { prisma } from "~/lib/prisma.server"
import { getUser } from "~/lib/user.server"
import bcrypt from "bcryptjs"

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })
// loader to fetch all users for listing
// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   try {
//     const users = await prisma.user.findMany({
//         where: {role: { slug: 'user' }},
//       select: { id: true, fullName: true, email: true },
//     });
//     return Response.json({ users });
//   } catch (err: any) {
//     return Response.json({ users: [], error: err.message }, { status: 500 });
//   }
// };

//  MAIN CONTROLLER HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase()
    switch (method) {
        case "GET":
            return await getAllChats(request)
        case "POST":
            return await createChat(request)
        // case "PUT":
        //     return await updateChat(request)
        // case "DELETE":
        //     return await deleteChat(request)
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

export const createChat = async (request: Request) => {
    try {
        const formData = await request.formData();

        // Parse basic fields
        const clientId = formData.get("clientId") ? Number(formData.get("clientId")) : null;
        const handleBy = formData.get("handleBy") ? Number(formData.get("handleBy")) : null;
        const clientQuery = formData.get("clientQuery")?.toString() || null;

        if (!clientId) {
            return Response.json({ success: false, message: "Please select a client." }, { status: 400 });
        }
        if (!handleBy) {
            return Response.json({ success: false, message: "Please select an agent (Handle By)." }, { status: 400 });
        }
        if (!clientQuery) {
            return Response.json({ success: false, message: "Client query is required." }, { status: 400 });
        }

        // Build chat data
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
        };

        // Handle file upload
        const chatTranscriptFile = formData.get("chatTranscript") as File | null;
        if (chatTranscriptFile) {
            const chatTranscriptUrl = await uploadFile(chatTranscriptFile);
            if (chatTranscriptUrl) chatData.chatTranscript = chatTranscriptUrl;
        }

        // Insert client emails
        const clientEmails = formData.getAll("clientEmails[]").map(email => email.toString());
        if (clientEmails.length > 0) {
            for (const email of clientEmails) {
                const exists = await prisma.clientEmail.findUnique({
                    where: { clientId, email } ,
                });
                if (!exists) {
                    await prisma.clientEmail.create({
                        data: { clientId, email },
                    });
                }
            }
        }

        // Create chat with relations
        const chat = await prisma.chat.create({
            data: {
                ...chatData,
                handleByUser: { connect: { id: handleBy } },
                client: { connect: { id: clientId } },
            },
        });

        return Response.json({ success: true, message: "Chat created successfully.", chat });
    } catch (error: any) {
        console.error("Create chat failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};


// Update profile
async function updateProfile(request: Request) {
    try {
        const currentUser = await getUser(request);
        if (!currentUser) return new Response("Unauthorized", { status: 401 });

        const formData = await request.formData();
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const avatarFile = formData.get("avatar") as File | null;
        const avatar = await uploadFile(avatarFile);
        const data: any = { fullName, email };
        if (avatar) data.avatar = avatar;

        await prisma.user.update({
            where: { id: currentUser.id },
            data,
        });

        return Response.json({ status: 200, success: true, message: 'Profile updated successfully!' });
    } catch (err: any) {
        console.error("Update profile failed:", err);
        return Response.json({ success: false, message: err.message }, { status: 400 });
    }
}

// Change password
async function changePassword(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return new Response("UserId not found.", { status: 401 });

        const data = await request.json();
        const parsed = changePasswordSchema.parse(data);

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return new Response("User not found", { status: 404 });

        const validCurrent = await bcrypt.compare(parsed.currentPassword, user.password);
        if (!validCurrent) return Response.json({ status: false, success: false, message: "Current password is incorrect" }, { status: 400 });

        const hashed = await bcrypt.hash(parsed.newPassword, 10);
        await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

        return new Response(JSON.stringify({ success: true, message: "Password updated successfully" }), { status: 200 });
    } catch (err: any) {
        return Response.json({ success: false, message: err.message }, { status: 400 });
    }
}
