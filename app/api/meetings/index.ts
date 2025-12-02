import { prisma } from "~/lib/prisma.server"
import { parseDate } from "~/lib/helper.sever"
import { getUserId } from "~/session.server"
import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server"

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

const createMeeting = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        const formData = await request.formData();

        const agentId = formData.get("agentId") ? Number(formData.get("agentId")) : null;
        const projectId = formData.get("projectId") ? Number(formData.get("projectId")) : null;

        if (!agentId) {
            return Response.json({ success: false, message: "Agent ID not found." }, { status: 400 });
        }

        const storeUrl = formData.get("storeUrl")?.toString() ?? ""

        const meetingData: any = {
            storeUrl: storeUrl.trim(),
            isExternalMeeting: formData.get("isExternalMeeting") === "true",
            meetingDetails: formData.get("meetingDetails")?.toString() ?? null,
            meetingDateTime: formData.get("meetingDateTime") ? new Date(formData.get("meetingDateTime") as string) : null,
            joiningStatus: formData.get("joiningStatus") === "true",
            meetingNotes: formData.get("meetingNotes")?.toString() ?? null,
            recordedVideo: formData.get("recordedVideo")?.toString() ?? null,
        };

        if (projectId) {
            meetingData.project = {
                connect: { id: projectId }
            }
        }

        const meeting = await prisma.meeting.create({
            data: {
                ...meetingData,
                user: {
                    connect: { id: agentId },
                },
            },
        });

        const reviewData: any = {
            reviewAsked: formData.get("reviewAsked") === "true",
            reviewStatus: formData.get("reviewGiven") === "true",
            reviewDate: parseDate(formData.get("reviewDate")),
            reviewText: formData.get("reviewsInfo")?.toString() ?? null,
        }
        const meetingId = meeting.id;
        const review = await prisma.review.create({
            data: {
                meeting: {
                    connect: { id: meetingId },
                },
                ...reviewData,
            }
        });

        const emails = formData.getAll("emails[]").map((email) => email.toString());

        if (emails.length > 0) {
            for (const email of emails) {
                const exists = await prisma.meetingEmail.findUnique({
                    where: { meetingId_email: { meetingId: meeting.id, email } },
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


        const logsParams = {
            userId: userId,
            action: "CREATE" as ActivityAction,
            modelName: "meeting",
            recordId: meeting.id,
            metaData: {
                meetingData: meeting,
                reviewData: review,
                emails: emails
            }
        }

        await ActivityLog(logsParams);

        return Response.json({ success: true, message: "Meeting created successfully.", meeting });
    } catch (error: any) {
        console.error("Create chat failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
