import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { addFeatureRequestSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

const methodNotAllowed = () =>
    Response.json({ message: "Method Not Allowed" }, { status: 405 });

//
// Main Handler
//
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase();
    switch (method) {
        case "POST":
            return await createFeatureRequest(request);
        default:
            return methodNotAllowed();
    }
};

//
// [POST] Create Feature Request
//
const createFeatureRequest = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Validate request body
        const value = addFeatureRequestSchema.parse(data);

        const featureRequestData:any = {
                shopUrl: value.shopUrl || null,
                shopName: value.shopName || null,
                email: value.email || null,
                featureDetails: value.featureDetails,
                createdByUser: { connect: { id: userId } },
            }
        if(value.projectId){
            featureRequestData.project = {connect: {id: Number(value.projectId)}}
        }
        // Create new Feature Request record
        const featureRequest = await prisma.featureRequest.create({
            data: featureRequestData,
        });

        // Log Activity
        await ActivityLog({
            userId,
            action: "CREATE" as ActivityAction,
            modelName: "featureRequest",
            recordId: featureRequest.id,
            metadata: { featureRequest },
        });

        // Return Success Response
        return Response.json({
            success: true,
            message: "Feature request created successfully.",
            featureRequest,
        });
    } catch (error: any) {
        console.error("Create feature request failed:", error);
        return Response.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};
