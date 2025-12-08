import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export async function seedUsers() {
  const adminRole = await prisma.role.findUnique({ where: { slug: "super-admin" } });

  if (!adminRole) throw new Error("Admin role must exist before seeding users");

  await prisma.user.upsert({
    where: { email: "superadmin@parsetrack.com" },
    update: {},
    create: {
      fullName: "Super Admin",
      email: "superadmin@parsetrack.com",
      password: await bcrypt.hash("Password@321", 10),
      roleId: adminRole.id,
    },
  });

  console.log("✅ Users seeded");
}
