
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: { request: Request }) {
    try {
        const formData = await request.formData();
        const clientId = Number(formData.get('clientId'));

        if (!clientId) {
            return Response.json({ status: 404, message: "Client not found" });
        }

        // Fetch chats for that client
        const marketingFunnels = await prisma.marketingFunnel.findMany({
            where: {
                clientId: clientId,
                isDeleted: false,
            },
            orderBy: { createdAt: "desc" },
            include: {
                client: {
                    select: {
                        id: true, shopDomain: true, shopName: true,
                        clientEmail: {
                            select: { id: true, email: true },
                        },
                    },
                },
                followUps: true,
            }
        });

        return Response.json({ status: 200, data: marketingFunnels });
    } catch (error: any) {
        console.error("Marketing funnels fetch error:", error);
        return Response.json({ status: 500, message: error.message });
    }
}
