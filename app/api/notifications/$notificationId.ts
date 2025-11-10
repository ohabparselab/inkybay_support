import { prisma } from "~/lib/prisma.server";

export async function action({ request, params }: { request: Request; params: any }) {

    const notificationId = Number(params.notificationId);
    if (!notificationId) return new Response(JSON.stringify({ message: "Chat ID required" }), { status: 400 });

    switch (request.method.toUpperCase()) {
        case "PATCH":
            return await updateNotificationRead(notificationId);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

const updateNotificationRead = async (id: number) => {
    try {
        await prisma.notification.update({
            where: { id: Number(id) },
            data: { isRead: true },
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false, error: "Failed to mark as read" }, { status: 500 });
    }

}