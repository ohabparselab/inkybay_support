import { addChatSchema, changePasswordSchema, createUserSchema } from "~/lib/validations"
import type { LoaderFunctionArgs } from "react-router"
import { uploadFile } from "~/lib/upload.server"
import { getUserId } from "~/session.server"
import { prisma } from "~/lib/prisma.server"
import { getUser } from "~/lib/user.server"
import bcrypt from "bcryptjs"

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })

//  MAIN CONTROLLER HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase()
    switch (method) {
        case "GET":
            return await getAllMeetings(request)
        case "POST":
            return await createMeeting(request)
        default:
            return methodNotAllowed()
    }
}

//
// [GET] Fetch all meetings
//
const getAllMeetings = async (_request: Request) => {
    try {
        const meetings = await prisma.meeting.findMany({});

        return Response.json({ success: true, meetings })
    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })

    }
}

//
// [POST] Create new meeting
//

export const createMeeting = async (request: Request) => {
    try {

        const formData = await request.formData();

        const agentId = formData.get("agentId") ? Number(formData.get("agentId")) : null;

        if (!agentId) {
            return Response.json({ success: false, message: "Agent ID found." }, { status: 400 });
        }

        // Build chat data
        const meetingData: any = {
            storeUrl: formData.get("storeUrl")?.toString() ?? "",
            isExternalMeeting: formData.get("isExternalMeeting") === "true",
            meetingDetails: formData.get("meetingDetails")?.toString() ?? null,
            meetingDateTime: new Date(formData.get("meetingDateTime") as string),
            reviewAsked: formData.get("reviewAsked") === "true",
            reviewGiven: formData.get("reviewGiven") === "true",
            reviewDate: new Date(formData.get("reviewDate") as string),
            reviewsInfo: formData.get("reviewsInfo")?.toString() ?? null,
            joiningStatus: formData.get("joiningStatus") === "true",
            meetingNotes: formData.get("meetingNotes")?.toString() ?? null,
        };

        // Handle file upload
        const recordedVideoFile = formData.get("recordedVideo") as File | null;
        if (recordedVideoFile) {
            const recordedVideoFileUrl = await uploadFile(recordedVideoFile);
            if (recordedVideoFileUrl) meetingData.recordedVideo = recordedVideoFileUrl;
        }

        const meeting = await prisma.meeting.create({
            data: {
                ...meetingData,
                user: {
                    connect: { id: agentId },
                },
            },
        });

        // Insert client emails
        const emails = formData.getAll("emails[]").map((email) => email.toString());
        if (emails.length > 0) {
            for (const email of emails) {
                const exists = await prisma.meetingEmail.findUnique({
                    where: {
                        meetingId_email: { meetingId: meeting.id, email },
                    },
                });

                if (!exists) {
                    await prisma.meetingEmail.create({
                        data: {
                            meetingId: meeting.id,
                            email,
                        },
                    });
                }
            }
        }

        return Response.json({ success: true, message: "Meeting created successfully.", meeting });
    } catch (error: any) {
        console.error("Create chat failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
