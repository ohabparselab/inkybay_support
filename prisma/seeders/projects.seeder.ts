import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedProjects() {
    await prisma.project.upsert({
        where: { slug: "inkybay" },
        update: {},
        create: {
            name: "InkyBay",
            slug: "inkybay",
        },
    });

    console.log("✅ Projects seeded");
}