import { addProjectSchema } from "~/lib/validations";
import { createSlug } from "~/lib/helper.sever";
import { prisma } from "~/lib/prisma.server";

export const action = async ({ request }: { request: Request }) => {

    try {
        const data = await request.json()
        const parsed = addProjectSchema.parse(data);

        const project = await prisma.project.create({
            data: {
                name: parsed.name,
                slug: createSlug(parsed.slug),
            },
        });

        return Response.json({ success: true, message: "Project created successfully.", project }, { status: 201 })
    } catch (error: any) {
        console.error("Create project failed:", error)
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}