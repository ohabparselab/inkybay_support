import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { AddCommunitySchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";


//
// [GET] Loader — Fetch single Community for View/Edit Modal
//
export async function loader({ params }: { params: any }) {
    
    const communityId = Number(params.communityId);

    if (!communityId) {
        return Response.json(
            { success: false, message: "Community ID is required." },
            { status: 400 }
        );
    }

    try {
        const community = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                project: {
                    select: { id: true, name: true },
                },
                addedBy: {
                    select: { id: true, fullName: true },
                },
                status: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, fullName: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!community) {
            return Response.json(
                { success: false, message: "Community not found." },
                { status: 404 }
            );
        }

        return Response.json({ success: true, community });
    } catch (error: any) {
        console.error("Loader community failed:", error);
        return Response.json(
            { success: false, message: error.message || "Internal server error." },
            { status: 500 }
        );
    }
}

export async function action({ request, params }: { request: Request; params: any }) {
    const communityId = Number(params.communityId);
    if (!communityId) {
        return new Response(JSON.stringify({ message: "Community ID required" }), { status: 400 });
    }

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateCommunity(communityId, request);
        case "DELETE":
            return await deleteCommunityHard(communityId, request);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

//
// [PUT] Update Community
//
const updateCommunity = async (communityId: number, request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Validate and sanitize
        const value = AddCommunitySchema.parse({
            ...data,
            listedDate: data.listedDate ? new Date(data.listedDate) : undefined,
        });

        const existingCommunity = await prisma.community.findUnique({
            where: { id: communityId },
        });

        if (!existingCommunity) {
            return Response.json({ success: false, message: "Community not found." }, { status: 404 });
        }

        // Build update data
        const communityData: any = {
            question: value.question,
            questionUrl: value.questionUrl,
            reply: value.reply || null,
            listedDate: value.listedDate ?? null,
            updatedAt: new Date(),
        };

        if (value.addedById) {
            communityData.addedBy = { connect: { id: Number(value.addedById) } };
        } else {
            communityData.addedBy = { disconnect: true };
        }

        // Connect relations
        if (value.statusId) {
            communityData.status = { connect: { id: Number(value.statusId) } };
        } else {
            communityData.status = { disconnect: true };
        }

        if (value.projectId) {
            communityData.project = { connect: { id: Number(value.projectId) } };
        } else {
            communityData.project = { disconnect: true };
        }

        const updatedCommunity = await prisma.community.update({
            where: { id: communityId },
            data: communityData,
            include: {
                status: true,
                project: true,
                addedBy: true,
            },
        });

        // Log activity
        await ActivityLog({
            userId,
            action: "UPDATE" as ActivityAction,
            modelName: "community",
            recordId: communityId,
            changes: {
                oldData: existingCommunity,
                newData: updatedCommunity,
            },
        });

        return Response.json({
            success: true,
            message: "Community updated successfully.",
            community: updatedCommunity,
        });
    } catch (error: any) {
        console.error("Update community failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};

//
// [DELETE] Hard delete Community
//
const deleteCommunityHard = async (communityId: number, request: Request) => {
    try {
        const userId = await getUserId(request);

        const existing = await prisma.community.findUnique({ where: { id: communityId } });
        if (!existing) {
            return Response.json({ success: false, message: "Community not found." }, { status: 404 });
        }

        await prisma.community.delete({
            where: { id: communityId },
        });

        await ActivityLog({
            userId,
            action: "DELETE" as ActivityAction,
            modelName: "community",
            recordId: communityId,
            metadata: { deleted: existing },
        });

        return Response.json({
            success: true,
            message: "Community permanently deleted.",
        });
    } catch (error: any) {
        console.error("Delete community failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
