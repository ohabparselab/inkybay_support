
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: { request: Request }) {
    try {
        const formData = await request.formData();
        const clientId = Number(formData.get('clientId'));
        const shopUrl = String(formData.get('shopUrl'));

        if (!clientId) {
            return Response.json({ status: 404, message: "Client not found" });
        }

        // Fetch chats for that client
        const reviews = await prisma.review.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { shopUrl: { contains: shopUrl } },
                            { chat: { client: { shopDomain: { contains: shopUrl } } } },
                            { meeting: { storeUrl: { contains: shopUrl } } },
                        ],
                    },
                    {
                        NOT: {
                            reviewText: null,
                        },
                    },
                    {
                        reviewText: { not: "" },
                    },
                ],
            },
            orderBy: { id: "desc" },
            include: {
                chat: {
                    select:
                    {
                        shopName: true,
                        shopUrl: true,
                        client: {
                            select: {
                                shopName: true,
                                shopDomain: true
                            }
                        },
                        projectId: true
                    }
                },
                meeting: {
                    select: {
                        projectId: true,
                        storeUrl: true
                    }
                },
                approachByUser: true,
                createdByUser: true,
                project: true
            }
        });

        return Response.json({ status: 200, data: reviews });
    } catch (error: any) {
        console.error("Marketing funnels fetch error:", error);
        return Response.json({ status: 500, message: error.message });
    }
}
