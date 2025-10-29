
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: { request: Request }) {
    try {
        const formData = await request.formData();
        const clientId = Number(formData.get('clientId'));

        if (!clientId) {
            return Response.json({ status: 404, message: "Client not found" });
        }

        // Fetch chats for that client
        const chats = await prisma.chat.findMany({
            where: {
                clientId: clientId,
                isDeleted: false,
            },
            orderBy: { createdAt: "desc" },
            include: {
                client: {
                    select: {
                        id: true,
                        shopDomain: true,
                        shopName: true,
                        clientEmail: { select: { id: true, email: true } },
                    },
                },
                handleByUser: { select: { id: true, fullName: true, email: true } },
                createdByUser: { select: { id: true, fullName: true } },
                updatedByUser: { select: { id: true, fullName: true } },
                chatTags: { include: { tag: { select: { name: true } } } },
                review: { include: { approachByUser: true } },
                project: { select: { name: true } },
                featureRequest: true,
            }
        });

        return Response.json({ status: 200, data: chats });
    } catch (error: any) {
        console.error("Chat fetch error:", error);
        return Response.json({ status: 500, message: error.message });
    }
}
