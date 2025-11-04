import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { prisma } from "~/lib/prisma.server";
import { addFeatureRequestSchema } from "~/lib/validations";
import { getUserId } from "~/session.server";

//
// Main Action Handler
//
export async function action({ request, params }: { request: Request; params: any }) {
    const featureRequestId = Number(params.featureId);
    if (!featureRequestId) {
        return new Response(JSON.stringify({ message: "Feature Request ID required" }), {
            status: 400,
        });
    }

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateFeatureRequest(featureRequestId, request);
        case "DELETE":
            return await deleteFeatureRequestHard(featureRequestId, request);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), {
                status: 405,
            });
    }
}

//
// [PUT] Update Feature Request
//
const updateFeatureRequest = async (featureRequestId: number, request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Validate data
        const value = addFeatureRequestSchema.parse(data);

        // Check existence
        const existingFeature = await prisma.featureRequest.findUnique({
            where: { id: featureRequestId },
        });

        if (!existingFeature) {
            return Response.json({ success: false, message: "Feature request not found." }, { status: 404 });
        }

        // Build update data
        const updateData = {
            shopUrl: value.shopUrl,
            shopName: value.shopName || null,
            email: value.email || null,
            featureDetails: value.featureDetails,
            updatedByUser: { connect: { id: userId } },
            updatedAt: new Date(),
        };

        const updatedFeature = await prisma.featureRequest.update({
            where: { id: featureRequestId },
            data: updateData,
        });

        // Log activity
        await ActivityLog({
            userId,
            action: "UPDATE" as ActivityAction,
            modelName: "featureRequest",
            recordId: featureRequestId,
            changes: {
                oldData: existingFeature,
                newData: updatedFeature,
            },
        });

        return Response.json({
            success: true,
            message: "Feature request updated successfully.",
            featureRequest: updatedFeature,
        });
    } catch (error: any) {
        console.error("Update feature request failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};

//
// [DELETE] Hard Delete Feature Request
//
const deleteFeatureRequestHard = async (featureRequestId: number, request: Request) => {
    try {
        const userId = await getUserId(request);

        const existing = await prisma.featureRequest.findUnique({
            where: { id: featureRequestId },
        });
        if (!existing) {
            return Response.json({ success: false, message: "Feature request not found." }, { status: 404 });
        }

        await prisma.featureRequest.delete({
            where: { id: featureRequestId },
        });

        await ActivityLog({
            userId,
            action: "DELETE" as ActivityAction,
            modelName: "featureRequest",
            recordId: featureRequestId,
            metadata: { deleted: existing },
        });

        return Response.json({
            success: true,
            message: "Feature request permanently deleted.",
        });
    } catch (error: any) {
        console.error("Delete feature request failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
