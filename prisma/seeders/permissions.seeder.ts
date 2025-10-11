import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedPermissions() {
  const permissions = [
    { name: "Create", slug: "create" },
    { name: "View", slug: "view" },
    { name: "Edit", slug: "edit" },
    { name: "Delete", slug: "delete" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: {},
      create: perm,
    });
  }

  console.log("✅ Permissions seeded");
}
