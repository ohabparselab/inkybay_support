import type { ActionFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: ActionFunctionArgs) {

    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const [
            totalTasks,
            pendingTasks,
            latestTasks,
            totalChats,
            totalFunnels,
            totalMeetings,
            todayMeetings,
            upcomingMeetings,
            totalReviews,
            totalFeatureRequest,
            totalCollaboration,
            totalCommunities,

        ] = await Promise.all([
            prisma.task.count({ where: { isDeleted: false } }),
            prisma.task.findMany({
                where: {
                    isDeleted: false,
                    status: { slug: "pending" },
                },
                take: 7,
                orderBy: { createdAt: "desc" },
                include: {
                    client: { select: { shopName: true, shopDomain: true } },
                    providedByUser: { select: { fullName: true } },
                    status: { select: { id: true, name: true } },
                },
            }),
            prisma.task.findMany({
                where: { isDeleted: false },
                take: 7,
                orderBy: { createdAt: "desc" },
                include: {
                    client: { select: { shopName: true, shopDomain: true } },
                    providedByUser: { select: { fullName: true } },
                    status: { select: { id: true, name: true } },
                },
            }),
            prisma.chat.count({ where: { isDeleted: false } }),
            prisma.marketingFunnel.count({ where: { isDeleted: false } }),
            prisma.meeting.count({ where: { isDeleted: false } }),
            prisma.meeting.findMany({
                where: {
                    isDeleted: false,
                    meetingDateTime: { gte: startOfToday, lte: endOfToday },
                },
                orderBy: { meetingDateTime: "asc" },
                take: 7,
                include: {
                    user: { select: { fullName: true, email: true } },
                },
            }),
            prisma.meeting.findMany({
                where: {
                    isDeleted: false,
                    meetingDateTime: { gt: endOfToday },
                },
                orderBy: { meetingDateTime: "asc" },
                take: 7,
                include: {
                    user: { select: { fullName: true, email: true } },
                },
            }),
            prisma.review.count({
                where: {
                    NOT: {
                        OR: [
                            { reviewText: null },
                            { reviewText: "" },
                        ],
                    },
                }
            }),
            prisma.featureRequest.count({}),
            prisma.collaborationApp.count({}),
            prisma.community.count({}),
        ]);

        const pendingTaskCount = await prisma.task.count({
            where: {
                isDeleted: false,
                status: { slug: "pending" },
            },
        });

        return Response.json({
            summary: {
                totalTasks,
                pendingTaskCount,
                totalChats,
                totalFunnels,
                totalMeetings,
                totalReviews,
                totalFeatureRequest,
                totalCollaboration,
                totalCommunities,
                todayMeetingCount: todayMeetings.length,
                upcomingMeetingCount: upcomingMeetings.length,
            },
            pendingTasks,
            latestTasks,
            todayMeetings,
            upcomingMeetings,
        });
    } catch (error: any) {
        console.error("Update meeting failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}
