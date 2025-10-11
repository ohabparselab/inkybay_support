import { updateUserSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";
import bcrypt from "bcryptjs";

export async function action({ request, params }: { request: Request; params: any }) {
    
    const userId = Number(params.id);
    if (!userId) return new Response(JSON.stringify({ message: "User ID required" }), { status: 400 });

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateUser(userId, request);
        case "DELETE":
            return await deleteUser(userId);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

async function updateUser(userId:number, request: Request) {
    try {
        const data = await request.json();
        const { permissions } = data

        if (!userId) throw new Error("User ID is required")

        // Validate against your existing schema but allow optional fields
        // You can use .partial() if needed
        const parsed = updateUserSchema.partial().parse(data)

        // Build update data dynamically
        const updateData: any = {}

        if (parsed.fullName) updateData.fullName = parsed.fullName
        if (parsed.email) updateData.email = parsed.email

        // Handle optional password (hash if present)
        if (parsed.password) {
            if (parsed.password.length < 6) throw new Error("Password must be at least 6 characters")
            updateData.password = await bcrypt.hash(parsed.password, 10)
        }

        // Handle role (lookup by slug)
        if (parsed.role) {
            const userRole = await prisma.role.findUnique({ where: { slug: parsed.role } })
            if (!userRole) throw new Error("Invalid role specified")
            updateData.roleId = userRole.id
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        })

        // --- Update Permissions ---
        if (permissions) {
            // Delete existing permissions first
            await prisma.userModulePermission.deleteMany({ where: { userId: userId } })

            // Recreate permissions
            const userPermissions = Object.entries(permissions).flatMap(([moduleId, permIds]) =>
                (permIds as number[]).map((permId) => ({
                    userId: userId,
                    moduleId: Number(moduleId),
                    permissionId: permId,
                })),
            )

            if (userPermissions.length > 0) {
                await prisma.userModulePermission.createMany({ data: userPermissions })
            }
        }

        return Response.json({
            success: true,
            message: "User updated successfully",
            user,
        })
    } catch (error: any) {
        console.error("Update user failed:", error)
        return Response.json({ success: false, message: error.message }, { status: 400 })
    }
}


async function deleteUser(userId: number) {
    try {
        
        if (!userId) throw new Error("User ID is required")

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { id: userId } })
        if (!existingUser) throw new Error("User not found")

        // Delete related user permissions first to maintain referential integrity
        await prisma.userModulePermission.deleteMany({
            where: { userId: userId },
        })

        // Delete the user
        await prisma.user.delete({
            where: { id: userId },
        })

        return Response.json({
            success: true,
            message: "User deleted successfully",
        })
    } catch (error: any) {
        console.error("Delete user failed:", error)
        return Response.json(
            { success: false, message: error.message },
            { status: 400 }
        )
    }
}

