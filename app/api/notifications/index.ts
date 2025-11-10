import { prisma } from "~/lib/prisma.server";
import { getUserId } from "~/session.server";

export async function loader({ request }: { request: Request }) {
    try {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") || 1);
        const limit = Number(url.searchParams.get("limit") || 10);
        const skip = (page - 1) * limit;

        const userId = await getUserId(request);

        const [
            unreadCount,
            notifications,
            totalCount,
        ] = await Promise.all([
            await prisma.notification.count({
                where: {
                    userId: userId,
                    isRead: false,
                },
            }),
            await prisma.notification.findMany({
                where: {
                    userId: userId
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { id: true, fullName: true, avatar: true } },
                },
            }),
            await prisma.notification.count({
                where: {
                    userId: userId
                }
            })
        ])

        return Response.json({
            success: true, 
            unreadCount,
            notifications,
            totalCount,
        });
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}