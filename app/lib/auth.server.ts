import bcrypt from "bcryptjs";
import { prisma } from "./prisma.server";
import { createUserSession } from "../session.server";

export async function verifyLogin(email: string, password: string) {
    try {

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return user;
    } catch (error) {
        return false;
    }
}

export async function handleLogin(email: string, password: string) {
    const user: any = await verifyLogin(email, password);
    if (!user) return null;

    return createUserSession(user.id, "/dashboard");
}
