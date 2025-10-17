
import { prisma } from "~/lib/prisma.server";

interface ShopInfo {
    shopName: string;
    shopEmail: string;
    shopUrl: string;
}

export async function getClientIdByShopInfo(shopInfo: ShopInfo): Promise<number | null> {
    try {
        const { shopName, shopEmail, shopUrl } = shopInfo;
        // Find existing client by shop URL
        let client = await prisma.client.findFirst({
            where: { shopDomain: shopUrl},
            select: { id: true },
        });

        //  If not found, create a new one
        if (!client) {
            client = await prisma.client.create({
                data: {
                    shopName: shopName,
                    email: shopEmail,
                    shopDomain: shopUrl
                },
                select: { id: true },
            });
        }

        return client.id;
    } catch (error) {
        console.error("Error in getClientIdByShopInfo:", error);
        return null;
    }
}
