import { prisma } from "~/lib/prisma.server";

export async function getUserPermissions(userId: number) {
    const userPermissions = await prisma.userModulePermission.findMany({
        where: { userId },
        include: { permission: true, module: true },
    });

    // combine module.slug + permission.slug for easier check
    const slugs = userPermissions.map(
        (up) => `${up.module.slug}.${up.permission.slug}`
    );

    return slugs; // e.g. ["chat.view", "chat.create"]
}

export function hasPermission(userPermissions: string[], permissionSlug: string) {
    return userPermissions.includes(permissionSlug);
}
