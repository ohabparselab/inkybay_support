import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

export async function loader({ request }: { request: Request }) {
    try {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") || 1);
        const limit = Number(url.searchParams.get("limit") || 10);
        const skip = (page - 1) * limit;

        const userId = await getUserId(request);

        if (!userId) {
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const [unreadCount, notifications, totalCount] = await Promise.all([
            prisma.notification.count({
                where: { userId, isRead: false },
            }),
            prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { id: true, fullName: true, avatar: true } },
                },
            }),
            prisma.notification.count({ where: { userId } }),
        ]);

        return Response.json({
            success: true,
            unreadCount,
            notifications,
            totalCount,
        });
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return Response.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
