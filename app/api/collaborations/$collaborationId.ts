import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { CollaborationSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

//
// [GET] Loader — Fetch single Collaboration for Edit Modal
//
export async function loader({ params }: { params: any }) {
    const collaborationId = Number(params.collaborationId);

    if (!collaborationId) {
        return  Response.json({ success: false, message: "Collaboration ID required" }, { status: 400 });
    }

    try {
        const collaboration = await prisma.collaborationApp.findUnique({
            where: { id: collaborationId },
            include: {
                emails: true,
                collaborationAreas: {
                    include: {
                        areaOption: true,
                    },
                },
                status: true,
                sendBy: {
                    select: { id: true, fullName: true },
                },
                addedBy: {
                    select: { id: true, fullName: true },
                },
                project: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!collaboration) {
            return Response.json({ success: false, message: "Collaboration not found." }, { status: 404 });
        }

        return Response.json({ success: true, collaboration: collaboration });
    } catch (error: any) {
        console.error("Loader collaboration failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function action({ request, params }: { request: Request; params: any }) {
    const collaborationId = Number(params.collaborationId);
    if (!collaborationId) {
        return new Response(JSON.stringify({ message: "Collaboration ID required" }), {
            status: 400,
        });
    }

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateCollaboration(collaborationId, request);
        case "DELETE":
            return await deleteCollaborationHard(collaborationId, request);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), {
                status: 405,
            });
    }
}

//
// [PUT] Update Collaboration
//
const updateCollaboration = async (collaborationId: number, request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Validate input
        const value = CollaborationSchema.parse(data);

        // Check if collaboration exists
        const existingCollaboration = await prisma.collaborationApp.findUnique({
            where: { id: collaborationId },
            include: {
                emails: true,
                collaborationAreas: true,
            },
        });

        if (!existingCollaboration) {
            return Response.json(
                { success: false, message: "Collaboration not found." },
                { status: 404 }
            );
        }

        // Prepare update payload
        const updateData: any = {
            appName: value.appName,
            appUrl: value.appUrl || null,
            companyName: value.companyName || null,
            companyUrl: value.companyUrl || null,
            appDetails: value.appDetails || null,
            projectId: value.projectId ? Number(value.projectId) : null,
            appAddedDate: value.appAddedDate
                ? new Date(value.appAddedDate)
                : existingCollaboration.appAddedDate,
            completedDate: value.completedDate
                ? new Date(value.completedDate)
                : existingCollaboration.completedDate,
            statusId: value.statusId ? Number(value.statusId) : null,
            sendById: value.sendById ? Number(value.sendById) : null,
            comments: value.comments || null,
            meetingDetails: value.meetingDetails || null,
            requestType: value.requestType || existingCollaboration.requestType,
            updatedAt: new Date(),
            addedById: userId,
        };

        // Update CollaborationApp main record
        const updatedCollaboration = await prisma.collaborationApp.update({
            where: { id: collaborationId },
            data: updateData,
        });

        // Sync Emails (replace all)
        if (value.emails) {
            await prisma.collaborationAppEmail.deleteMany({
                where: { appId: collaborationId },
            });

            await prisma.collaborationAppEmail.createMany({
                data: value.emails.map((email) => ({
                    appId: collaborationId,
                    email,
                })),
            });
        }

        // Sync Collaboration Areas (replace all)
        if (value.collaborationAreas) {
            await prisma.collaborationAppArea.deleteMany({
                where: { appId: collaborationId },
            });

            await prisma.collaborationAppArea.createMany({
                data: value.collaborationAreas.map((areaId) => ({
                    appId: collaborationId,
                    areaOptionId: areaId,
                })),
            });
        }

        // Fetch fresh copy for logging
        const newCollaboration = await prisma.collaborationApp.findUnique({
            where: { id: collaborationId },
            include: {
                emails: true,
                collaborationAreas: true,
            },
        });

        // Log activity
        await ActivityLog({
            userId,
            action: "UPDATE" as ActivityAction,
            modelName: "collaboration",
            recordId: collaborationId,
            changes: {
                oldData: existingCollaboration,
                newData: newCollaboration,
            },
        });

        return Response.json({
            success: true,
            message: "Collaboration updated successfully.",
            collaboration: newCollaboration,
        });
    } catch (error: any) {
        console.error("Update collaboration failed:", error);
        return Response.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

//
// [DELETE] Hard Delete Collaboration
//
const deleteCollaborationHard = async (collaborationId: number, request: Request) => {
    try {
        const userId = await getUserId(request);

        const existing = await prisma.collaborationApp.findUnique({
            where: { id: collaborationId },
            include: { emails: true, collaborationAreas: true },
        });

        if (!existing) {
            return Response.json(
                { success: false, message: "Collaboration not found." },
                { status: 404 }
            );
        }

        // Delete child relations first
        await prisma.collaborationAppEmail.deleteMany({ where: { appId: collaborationId } });
        await prisma.collaborationAppArea.deleteMany({ where: { appId: collaborationId } });

        // Delete main record
        await prisma.collaborationApp.delete({
            where: { id: collaborationId },
        });

        // Log delete
        await ActivityLog({
            userId,
            action: "DELETE" as ActivityAction,
            modelName: "collaborationApp",
            recordId: collaborationId,
            metadata: { deleted: existing },
        });

        return Response.json({
            success: true,
            message: "Collaboration permanently deleted.",
        });
    } catch (error: any) {
        console.error("Delete collaboration failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
