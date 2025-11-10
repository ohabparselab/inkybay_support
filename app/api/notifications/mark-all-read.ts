import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

export async function action({ request, params }: { request: Request; params: any }) {

    switch (request.method.toUpperCase()) {
        case "POST":
            return await notificationMarkAsRead(request);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

const notificationMarkAsRead = async (request: Request) => {
    try {
        const userId = await getUserId(request);
        await prisma.notification.updateMany({
            where: { userId: userId },
            data: { isRead: true },
        });
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false, error: "Failed to mark as read" }, { status: 500 });
    }
}