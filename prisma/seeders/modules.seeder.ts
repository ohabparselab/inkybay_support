import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedModules() {
  const modules = [
    { name: "Shop", slug: "shop" },
    { name: "Chat", slug: "chats" },
    { name: "Task", slug: "tasks" },
    { name: "Meeting", slug: "meetings" },
    { name: "Marketing Funnel", slug: "marketing-funnels" },
    { name: "Review", slug: "review" },
    { name: "Feature Request", slug: "feature" },
    { name: "Collaboration", slug: "collaboration" },
    { name: "Shopify Community", slug: "community" }
  ];

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { slug: mod.slug },
      update: {},
      create: mod,
    });
  }

  console.log("✅ Modules seeded");
}