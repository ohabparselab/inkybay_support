import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { addReviewSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";


const methodNotAllowed = () =>
    Response.json({ message: "Method Not Allowed" }, { status: 405 });

// MAIN HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase();
    switch (method) {
        case "POST":
            return await createReview(request);
        default:
            return methodNotAllowed();
    }
};

//
// [POST] Create a new review
//
const createReview = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Parse & validate data
        const value = addReviewSchema.parse({
            ...data,
            agentRating: Number(data.agentRating),
            lastReviewApproach: data.lastReviewApproach ? new Date(data.lastReviewApproach) : undefined,
            reviewSubmittedAt: data.reviewSubmittedAt ? new Date(data.reviewSubmittedAt) : undefined,
        });

        // Build clean review data
        const reviewData:any = {
            shopUrl: value.shopUrl,
            shopName: value.shopName,
            agentRating: value.agentRating,
            ratingMood: value.ratingMood,
            reviewText: value.reviewText,
            lastReviewApproach: value.lastReviewApproach ? new Date(value.lastReviewApproach) : null,
            reviewSubmittedAt: value.reviewSubmittedAt ? new Date(value.reviewSubmittedAt) : null,
            createdByUser: { connect: { id: userId } },
        };

        if (value.reviewApproachBy) {
            const reviewApproachBy = Number(value.reviewApproachBy);
            if (!isNaN(reviewApproachBy)) {
                reviewData.approachByUser = { connect: { id: reviewApproachBy } };
            }
        }

        if (value.projectId) {
            reviewData.project = { connect: { id: Number(value.projectId) } };
        }

        // Create review record
        const review = await prisma.review.create({
            data: reviewData,
        });

        // Log activity
        const logsParams = {
            userId: userId,
            action: "CREATE" as ActivityAction,
            modelName: "review",
            recordId: review.id,
            metaData: { reviewData: review },
        };
        await ActivityLog(logsParams);

        return Response.json({
            success: true,
            message: "Review added successfully.",
            review,
        });
    } catch (error: any) {
        console.error("Create review failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
