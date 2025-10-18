
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: { request: Request }) {
    try {
        const formData = await request.formData();

        const shopInfoParams = {
            shopName: formData.get('shopName') as string,
            shopEmail: formData.get('shopEmail') as string,
            shopUrl: formData.get('shopUrl') as string,
        }

        let client = await prisma.client.findFirst({
            where: { shopDomain: shopInfoParams.shopUrl},
            select: { id: true },
        });

        //  If not found, create a new one
        if (!client) {
            client = await prisma.client.create({
                data: {
                    shopName: shopInfoParams.shopName,
                    email: shopInfoParams.shopEmail,
                    shopDomain: shopInfoParams.shopUrl
                },
                select: { id: true },
            });
        }

        return Response.json({ status: 200, data: client });
    } catch (error: any) {
        console.error("Client fetch error:", error);
        return Response.json({ status: 500, message: error.message });
    }
}
