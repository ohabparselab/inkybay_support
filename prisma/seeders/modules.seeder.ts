import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedModules() {
  const modules = [
    { name: "Clients", slug: "clients" },
    { name: "Chats", slug: "chats" },
    { name: "Tasks", slug: "tasks" },
    { name: "Meetings", slug: "meetings" },
    { name: "Marketing Funnel", slug: "marketing-funnel" }
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