import { ActivityLog, type ActivityAction } from "~/lib/activity-log.server";
import { addCommentSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

//
// Main Action Handler
//
export async function action({ request, params }: { request: Request; params: any }) {
    const commentId = Number(params.commentId);
    if (!commentId) {
        return new Response(JSON.stringify({ message: "Comment ID required" }), { status: 400 });
    }

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateComment(commentId, request);
        case "DELETE":
            return await deleteComment(commentId, request);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

//
// [PUT] Update Comment
//
const updateComment = async (commentId: number, request: Request) => {
    try {
        const userId = await getUserId(request);
        const data = await request.json();

        // Validate input
        const value = addCommentSchema.parse(data);

        // Check comment existence
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { mentions: true },
        });

        if (!existingComment) {
            return Response.json({ success: false, message: "Comment not found." }, { status: 404 });
        }

        // Only allow comment owner to update
        if (existingComment.userId !== userId) {
            return Response.json({ success: false, message: "Not authorized to update this comment." }, { status: 403 });
        }

        // Build update data
        const updateData: any = {
            content: value.content,
            updatedAt: new Date(),
        };

        // Update comment
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: updateData,
            include: { user: true, replies: true, mentions: true },
        });

        // Update mentions
        if (value.mentions) {
            // Delete old mentions
            await prisma.commentMention.deleteMany({ where: { commentId } });

            // Create new mentions
            const mentionCreates = value.mentions.map((mentionedId: number) =>
                prisma.commentMention.create({ data: { commentId, mentionedId } })
            );
            await Promise.all(mentionCreates);
        }

        // Log activity
        await ActivityLog({
            userId,
            action: "UPDATE" as ActivityAction,
            modelName: "comment",
            recordId: commentId,
            changes: {
                oldData: existingComment,
                newData: updatedComment,
            },
        });

        return Response.json({
            success: true,
            message: "Comment updated successfully.",
            comment: updatedComment,
        });
        
    } catch (error: any) {
        console.error("Update comment failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};

//
// [DELETE] Hard Delete Comment
//
const deleteComment = async (commentId: number, request: Request) => {
    try {
        const userId = await getUserId(request);

        // Check comment existence
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { mentions: true, replies: true },
        });

        if (!existingComment) {
            return Response.json({ success: false, message: "Comment not found." }, { status: 404 });
        }

        // Only allow comment owner to delete
        if (existingComment.userId !== userId) {
            return Response.json({ success: false, message: "Not authorized to delete this comment." }, { status: 403 });
        }

        // Delete mentions
        await prisma.commentMention.deleteMany({ where: { commentId } });

        // Optionally, delete replies recursively
        await prisma.comment.deleteMany({ where: { parentId: commentId } });

        // Delete the comment
        await prisma.comment.delete({ where: { id: commentId } });

        // Log activity
        await ActivityLog({
            userId,
            action: "DELETE" as ActivityAction,
            modelName: "comment",
            recordId: commentId,
            metadata: { deletedComment: existingComment },
        });

        return Response.json({
            success: true,
            message: "Comment deleted successfully.",
        });
    } catch (error: any) {
        console.error("Delete comment failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
