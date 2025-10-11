import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";
import { createUserSession } from "../session.server";

export async function verifyLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user:any = await verifyLogin(email, password);
  if (!user) return null;

  return createUserSession(user.id, "/dashboard");
}
