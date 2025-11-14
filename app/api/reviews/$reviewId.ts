import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { addReviewSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

export async function action({ request, params }: { request: Request; params: any }) {
    const reviewId = Number(params.reviewId);
    if (!reviewId) {
        return new Response(JSON.stringify({ message: "Review ID required" }), { status: 400 });
    }

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateReview(reviewId, request);
        case "DELETE":
            return await deleteReviewHard(reviewId, request);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

//
// [PUT] Update review
//
const updateReview = async (reviewId: number, request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Validate and sanitize
        const value = addReviewSchema.parse({
            ...data,
            agentRating: Number(data.agentRating),
            lastReviewApproach: data.lastReviewApproach ? new Date(data.lastReviewApproach) : undefined,
            reviewSubmittedAt: data.reviewSubmittedAt ? new Date(data.reviewSubmittedAt) : undefined,
        });

        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!existingReview) {
            return Response.json({ success: false, message: "Review not found." }, { status: 404 });
        }

        const reviewApproachBy = value.reviewApproachBy ? Number(value.reviewApproachBy) : null;

        // Build update data
        const reviewData: any = {
            shopUrl: value.shopUrl,
            shopName: value.shopName,
            agentRating: value.agentRating,
            ratingMood: value.ratingMood,
            reviewText: value.reviewText,
            lastReviewApproach: value.lastReviewApproach ?? null,
            reviewSubmittedAt: value.reviewSubmittedAt ?? null,
            updatedByUser: { connect: { id: userId } },
        };

        if (reviewApproachBy) {
            reviewData.approachByUser = { connect: { id: reviewApproachBy } };
        } else {
            reviewData.approachByUser = { disconnect: true };
        }

        if (value.projectId) {
            reviewData.project = { connect: { id: Number(value.projectId) } };
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: reviewData,
        });

        // Log activity
        await ActivityLog({
            userId,
            action: "UPDATE" as ActivityAction,
            modelName: "review",
            recordId: reviewId,
            changes: {
                oldData: existingReview,
                newData: updatedReview,
            },
        });

        return Response.json({
            success: true,
            message: "Review updated successfully.",
            review: updatedReview,
        });
    } catch (error: any) {
        console.error("Update review failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};

//
// [DELETE] Hard delete review
//
const deleteReviewHard = async (reviewId: number, request: Request) => {
    try {
        const userId = await getUserId(request);

        const existing = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!existing) {
            return Response.json({ success: false, message: "Review not found." }, { status: 404 });
        }

        await prisma.review.delete({
            where: { id: reviewId },
        });

        await ActivityLog({
            userId,
            action: "DELETE" as ActivityAction,
            modelName: "review",
            recordId: reviewId,
            metadata: { deleted: existing },
        });

        return Response.json({
            success: true,
            message: "Review permanently deleted.",
        });
    } catch (error: any) {
        console.error("Delete review failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
