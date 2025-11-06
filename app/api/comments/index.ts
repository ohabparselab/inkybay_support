import { prisma } from "~/lib/prisma.server";

export async function loader({ request }: { request: Request }) {
    try {
        const url = new URL(request.url);
        const contextType = url.searchParams.get("type");
        const contextId = url.searchParams.get("id");

        if (!contextType || !contextId) {
            return Response.json({ success: false, message: "Missing type or id parameter" }, { status: 400 });
        }

        const where:any = {};

        if(contextType == 'community'){
            where.communityId = Number(contextId)
        }
        
        if(contextType == 'task'){
            where.taskId = Number(contextId)
        }

        const comments = await prisma.comment.findMany({
            where: where,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, fullName: true, avatar: true },
                },
                replies: true
            },
        });

        return Response.json({ success: true, comments });
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return Response.json(
            { success: false, message: "Failed to load comments", error: error.message },
            { status: 500 }
        );
    }
}
