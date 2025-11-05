import { createSlug } from "~/lib/helper.sever";
import { prisma } from "~/lib/prisma.server";
import { createStatusSchema } from "~/lib/validations";

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })

export async function loader() {
    try {
        const areas = await prisma.collaborationArea.findMany({
            orderBy: { createdAt: "desc" },
        });

        return Response.json({ areas });
    } catch (error) {
        return Response.json(error);
    }
}

//  MAIN CONTROLLER HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase()
    switch (method) {
        case "POST":
            return await createColArea(request);
        default:
            return methodNotAllowed()
    }
}

const createColArea = async (request: Request) => {
    try {
        const data = await request.json()
        const parsed = createStatusSchema.parse(data);

        const area = await prisma.collaborationArea.create({
            data: {
                name: parsed.name,
                slug: createSlug(parsed.name),
            },
        });
        return Response.json({ success: true, message: "Collaboration area created successfully", area })
    } catch (error: any) {
        console.error("Create col area failed:", error)
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
