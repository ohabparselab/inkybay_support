import { addTaskSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import { uploadFile } from "~/lib/upload.server";

export async function action({ request, params }: { request: Request; params: any }) {

    const meetingId = Number(params.meetingId);
    if (!meetingId) return new Response(JSON.stringify({ message: "Meeting ID required" }), { status: 400 });

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateMeeting(meetingId, request);
        case "DELETE":
            return await deleteMeetingHard(meetingId);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

export const updateMeeting = async (meetingId: number, request: Request) => {
    try {
        const formData = await request.formData();

        const agentId = formData.get("agentId") ? Number(formData.get("agentId")) : null;

        if (!agentId) {
            return Response.json({ success: false, message: "Agent ID not found." }, { status: 400 });
        }

        // Find existing meeting
        const existingMeeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
        });

        if (!existingMeeting) {
            return Response.json({ success: false, message: "Meeting not found." }, { status: 404 });
        }

        // Build updated data
        const meetingData: any = {
            storeUrl: formData.get("storeUrl")?.toString() ?? "",
            isExternalMeeting: formData.get("isExternalMeeting") === "true",
            meetingDetails: formData.get("meetingDetails")?.toString() ?? null,
            meetingDateTime: formData.get("meetingDateTime")
                ? new Date(formData.get("meetingDateTime") as string)
                : existingMeeting.meetingDateTime,
            reviewAsked: formData.get("reviewAsked") === "true",
            reviewGiven: formData.get("reviewGiven") === "true",
            reviewDate: formData.get("reviewDate")
                ? new Date(formData.get("reviewDate") as string)
                : existingMeeting.reviewDate,
            reviewsInfo: formData.get("reviewsInfo")?.toString() ?? null,
            joiningStatus: formData.get("joiningStatus") === "true",
            meetingNotes: formData.get("meetingNotes")?.toString() ?? null,
        };

        // Handle new video upload (optional)
        const recordedVideoFile = formData.get("recordedVideo") as File | null;
        if (recordedVideoFile && recordedVideoFile.size > 0) {
            const recordedVideoFileUrl = await uploadFile(recordedVideoFile);
            if (recordedVideoFileUrl) {
                meetingData.recordedVideo = recordedVideoFileUrl;
            }
        }

        // Update meeting
        const updatedMeeting = await prisma.meeting.update({
            where: { id: meetingId },
            data: {
                ...meetingData,
                user: { connect: { id: agentId } },
            },
        });

        // Update meeting emails
        const emails = formData.getAll("emails[]").map((email) => email.toString());
        if (emails.length > 0) {
            // Delete old emails not in the new list
            await prisma.meetingEmail.deleteMany({
                where: {
                    meetingId: meetingId,
                    email: { notIn: emails },
                },
            });

            // Add new emails if not already existing
            for (const email of emails) {
                const exists = await prisma.meetingEmail.findUnique({
                    where: { meetingId_email: { meetingId, email } },
                });

                if (!exists) {
                    await prisma.meetingEmail.create({
                        data: { meetingId, email },
                    });
                }
            }
        }

        return Response.json({
            success: true,
            message: "Meeting updated successfully.",
            meeting: updatedMeeting,
        }, { status: 200 });
    } catch (error: any) {
        console.error("Update meeting failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};

export const deleteMeetingHard = async (meetingId: number) => {
    try {
        // Delete all associated meeting emails first
        await prisma.meetingEmail.deleteMany({
            where: { meetingId },
        });

        // Then delete the meeting itself
        await prisma.meeting.delete({
            where: { id: meetingId },
        });

        return Response.json({ success: true, message: "Meeting permanently deleted." });
    } catch (error: any) {
        console.error("Hard delete meeting failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};

