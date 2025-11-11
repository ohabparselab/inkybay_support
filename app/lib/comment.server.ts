import { prisma } from "./prisma.server";

export async function getCommentInfoById(commentId: number): Promise<any> {

    if (!commentId) return false;
    const comment = await prisma.comment.findUnique({
        where: { id: commentId }
    });

    return comment;
}