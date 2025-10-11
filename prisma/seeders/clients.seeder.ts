import { PrismaClient, StoreStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedClients() {
    const store = await prisma.client.upsert({
        where: { shopDomain: "inkybay.myshopify.com" },
        update: {},
        create: {
            shopDomain: "inkybay.myshopify.com",
            email: "info@inkybay.com",
            shopName: "InkyBay Store",
            accessToken: "shpat_test_1234567890abcdef",
            planName: "Shopify Plus",
            country: "US",
            currency: "USD",
            timezone: "America/New_York",
            installedAt: new Date("2025-10-11T10:00:00Z"),
            status: StoreStatus.ACTIVE,
            isDeleted: false,
        },
    });

    console.log("✅ Clients seeded");
}