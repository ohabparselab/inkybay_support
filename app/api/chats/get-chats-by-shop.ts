
import { getClientIdByShopInfo } from "~/lib/client.server";
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: { request: Request }) {
    try {
        const formData = await request.formData();

        const shopInfoParams = {
            shopName: formData.get('shopName') as string,
            shopEmail: formData.get('shopEmail') as string,
            shopUrl: formData.get('shopUrl') as string,
        }

        const clientId = await getClientIdByShopInfo(shopInfoParams)

        if (!clientId) {
            return Response.json({ status: 404, message: "Client not found" });
        }

        // Fetch chats for that client
        const chats = await prisma.chat.findMany({
            where: {
                clientId: clientId,
                isDeleted: false,
            },
            include: {
                handleByUser: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return Response.json({ status: 200, data: chats });
    } catch (error: any) {
        console.error("Chat fetch error:", error);
        return Response.json({ status: 500, message: error.message });
    }
}
