import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { CollaborationSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

// Validation Schema


const methodNotAllowed = () =>
    Response.json({ message: "Method Not Allowed" }, { status: 405 });

// MAIN HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase();

    switch (method) {
        case "POST":
            return await createCollaboration(request);
        default:
            return methodNotAllowed();
    }
};

//
// [POST] Create a new Collaboration
//
const createCollaboration = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        const body = await request.json();

        // Parse & validate data
        const data = CollaborationSchema.parse(body);

        // Prepare clean data for Prisma
        const collaborationData: any = {
            appName: data.appName,
            appUrl: data.appUrl || null,
            companyName: data.companyName || null,
            companyUrl: data.companyUrl || null,
            appDetails: data.appDetails || null,
            appAddedDate: data.appAddedDate ? new Date(data.appAddedDate) : null,
            completedDate: data.completedDate ? new Date(data.completedDate) : null,
            comments: data.comments || null,
            meetingDetails: data.meetingDetails || null,
            requestType: data.requestType || null,
            addedBy: { connect: { id: userId } },
        };

        if (data.projectId) {
            collaborationData.project = { connect: { id: Number(data.projectId) } };
        }

        if (data.statusId) {
            collaborationData.status = { connect: { id: Number(data.statusId) } };
        }

        if (data.sendById) {
            collaborationData.sendBy = { connect: { id: Number(data.sendById) } };
        }

        // Create the collaboration
        const collaboration = await prisma.collaborationApp.create({
            data: {
                ...collaborationData,
                emails: {
                    create: data.emails?.map((email) => ({ email })) || [],
                },
                collaborationAreas: {
                    create:
                        data.collaborationAreas?.map((areaId) => ({
                            areaOption: { connect: { id: areaId } },
                        })) || [],
                },
            },
            include: {
                emails: true,
                collaborationAreas: {
                    include: { areaOption: true },
                },
                status: true,
                addedBy: true,
                sendBy: true,
            },
        });

        // Log activity
        await ActivityLog({
            userId,
            action: "CREATE" as ActivityAction,
            modelName: "collaboration",
            recordId: collaboration.id,
            metadata: { collaboration },
        });

        // Return response
        return Response.json({
            success: true,
            message: "Collaboration added successfully.",
            collaboration,
        });
    } catch (error: any) {
        console.error("Create collaboration failed:", error);
        return Response.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
};
