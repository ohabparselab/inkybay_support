import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedPlatforms() {
    const project: any = await prisma.project.findUnique({
        where: { slug: 'inkybay' }
    })
    await prisma.platform.upsert({
        where: { slug: 'shopify' },
        update: {},
        create: {
            projectId: project.id,
            name: "Shopify",
            slug: "shopify",
        },
    });

    console.log("✅ Projects seeded");
}