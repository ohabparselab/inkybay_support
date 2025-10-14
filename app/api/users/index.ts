import { changePasswordSchema, createUserSchema } from "~/lib/validations"
import type { LoaderFunctionArgs } from "react-router"
import { uploadFile } from "~/lib/upload.server"
import { getUserId } from "~/session.server"
import { prisma } from "~/lib/prisma.server"
import { getUser } from "~/lib/user.server"
import bcrypt from "bcryptjs"

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })
// loader to fetch all users for listing
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const users = await prisma.user.findMany({
        where: {role: { slug: 'user' }},
      select: { id: true, fullName: true, email: true },
    });
    return Response.json({ users });
  } catch (err: any) {
    return Response.json({ users: [], error: err.message }, { status: 500 });
  }
};

//  MAIN CONTROLLER HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase()
    switch (method) {
        case "GET":
            return await getUsers(request)
        case "POST":
            return await createUser(request)
        case "PUT":
            return await updateProfile(request)
        case "PATCH":
            return await changePassword(request)
        default:
            return methodNotAllowed()
    }
}

//
// [GET] Fetch all users
//
async function getUsers(_request: Request) {
    const users = await prisma.user.findMany({
        include: {
            modulePermissions: {
                include: { permission: true, module: true },
            },
        },
    })

    return Response.json({ success: true, users })
}

//
// [POST] Create new user
//
async function createUser(request: Request) {
    try {
        const data = await request.json()
        const parsed = createUserSchema.parse(data)

        const { fullName, email, password, role, permissions } = parsed
        const hashedPassword = await bcrypt.hash(password, 10)
        const userRole = await prisma.role.findUnique({ where: { slug: role } })
        if (!userRole) throw new Error("Invalid role specified");
        const user = await prisma.user.create({
            data: { fullName, email, password: hashedPassword, roleId: userRole.id },
        })

        if (permissions && Object.keys(permissions).length > 0) {
            const userPermissions = Object.entries(permissions).flatMap(([moduleId, permIds]) =>
                (permIds as number[]).map((permId) => ({
                    userId: user.id,
                    moduleId: Number(moduleId),
                    permissionId: permId,
                })),
            )

            await prisma.userModulePermission.createMany({ data: userPermissions })
        }

        return Response.json({ success: true, message: "User created successfully", user })
    } catch (error: any) {
        console.error("Create user failed:", error)
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}

// Update profile
async function updateProfile(request: Request) {
    try {
        const currentUser = await getUser(request);
        if (!currentUser) return new Response("Unauthorized", { status: 401 });

        const formData = await request.formData();
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const avatarFile = formData.get("avatar") as File | null;
        const data: any = { fullName, email };
        const avatar = await uploadFile(avatarFile);
        if (avatar) data.avatar = avatar;

        await prisma.user.update({
            where: { id: currentUser.id },
            data,
        });

        return Response.json({ status: 200, success: true, message: 'Profile updated successfully!' });
    } catch (err: any) {
        console.error("Update profile failed:", err);
        return Response.json({ success: false, message: err.message }, { status: 400 });
    }
}

// Change password
async function changePassword(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return new Response("UserId not found.", { status: 401 });

        const data = await request.json();
        const parsed = changePasswordSchema.parse(data);

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return new Response("User not found", { status: 404 });

        const validCurrent = await bcrypt.compare(parsed.currentPassword, user.password);
        if (!validCurrent) return Response.json({ status: false, success: false, message: "Current password is incorrect" }, { status: 400 });

        const hashed = await bcrypt.hash(parsed.newPassword, 10);
        await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

        return new Response(JSON.stringify({ success: true, message: "Password updated successfully" }), { status: 200 });
    } catch (err: any) {
        return Response.json({ success: false, message: err.message }, { status: 400 });
    }
}
