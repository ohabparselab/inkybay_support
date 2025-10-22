import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedClients() {
    const store = await prisma.client.upsert({
        where: { shopDomain: "inkybay.myshopify.com" },
        update: {},
        create: {
            shopDomain: "inkybay.myshopify.com",
            email: "info@inkybay.com",
            shopName: "InkyBay Store"
        },
    });

    console.log("✅ Clients seeded");
}