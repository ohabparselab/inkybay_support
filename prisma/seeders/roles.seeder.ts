import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedRoles() {
  const roles = [
    { name: "Super Admin", slug: "super-admin" },
    { name: "User", slug: "user" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded");
}
