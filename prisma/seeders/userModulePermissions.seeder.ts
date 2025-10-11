import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedUserModulePermissions() {
  const admin = await prisma.user.findUnique({ where: { email: "superadmin@inkybay.com" } });
  const permissions = await prisma.permission.findMany();
  const modules = await prisma.module.findMany();

  if (!admin) throw new Error("Admin user must exist");

  const records = [];

  for (const mod of modules) {
    for (const perm of permissions) {
      records.push({
        userId: admin.id,
        moduleId: mod.id,
        permissionId: perm.id,
      });
    }
  }

  // Insert all at once
  await prisma.userModulePermission.createMany({
    data: records,
    skipDuplicates: true, // optional: skips if exact same row exists
  });

  console.log("✅ UserModulePermissions seeded");
}
