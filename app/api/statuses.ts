import { createSlug } from "~/lib/helper.sever";
import { prisma } from "~/lib/prisma.server";
import { createStatusSchema } from "~/lib/validations";

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })

export async function loader() {
    try {
        const statuses = await prisma.status.findMany({
            orderBy: { createdAt: "desc" },
        });

        return Response.json({ statuses });
    } catch (error) {
        return Response.json(error);
    }
}

//  MAIN CONTROLLER HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase()
    console.log("=========>>", method)
    switch (method) {
        // case "GET":
        // return await getAllStatues(request);
        case "POST":
            return await createStatus(request);
        default:
            return methodNotAllowed()
    }
}

const createStatus = async (request: Request) => {
    try {
        const data = await request.json()
        const parsed = createStatusSchema.parse(data);

        const status = await prisma.status.create({
            data: {
                name: parsed.name,
                slug: createSlug(parsed.name),
            },
        });
        return Response.json({ success: true, message: "Status created successfully", status })
    } catch (error: any) {
        console.error("Create user failed:", error)
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
