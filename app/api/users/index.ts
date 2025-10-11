import { uploadFile } from "~/lib/upload.server"
import { createUserSchema } from "~/lib/validations"
import { prisma } from "~/lib/prisma.server"
import { getUser } from "~/lib/user.server"
import bcrypt from "bcryptjs"

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })

// Common utility to parse JSON safely
async function parseRequest<T>(request: Request): Promise<T> {
    try {
        return await request.json()
    } catch {
        throw new Error("Invalid JSON payload")
    }
}

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
        const data = await parseRequest<any>(request)
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
        return Response.json({ success: false, message: error.message }, { status: 400 })
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
        const avatar = await uploadFile(avatarFile);
        const data: any = { fullName, email };
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
