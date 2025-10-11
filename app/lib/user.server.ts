import { getUserId } from "@/session.server";
import { prisma } from "./prisma.server";

export async function getUser(request: Request) {
    const userId = await getUserId(request);
    if (!userId) return null;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            isActive: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            modulePermissions: {
                where: { isDeleted: false },
                select: {
                    id: true,
                    module: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    permission: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
        },
    });

    return user;
}
export type User = {
  id: number;
  fullName: string;
  email: string;
  avatar?: string | null;
  role?: {
    id: number;
    slug: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};
