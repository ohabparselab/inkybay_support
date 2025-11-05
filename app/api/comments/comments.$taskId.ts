import type { ActionFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma.server";

export async function loader({ request, params }: { request: Request; params: any }) {
    try {

        const taskId = Number(params.taskId);
        if (!taskId) return new Response(JSON.stringify({ message: "Task ID required" }), { status: 400 });

        const taskComments = await prisma.comment.findMany({
            where: { taskId: taskId }
        })
        return Response.json({ comments: taskComments });
    } catch (error: any) {
        console.error("Getting error while fetching tasks comments:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}