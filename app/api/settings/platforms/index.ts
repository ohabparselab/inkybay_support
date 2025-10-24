import { addPlatformSchema } from "~/lib/validations";
import { createSlug } from "~/lib/helper.sever";
import { prisma } from "~/lib/prisma.server";

export const action = async ({ request }: { request: Request }) => {
    try {
        const data = await request.json()
        const parsed = addPlatformSchema.parse(data);

        const newPlatform = await prisma.platform.create({
            data: {
                name: parsed.name,
                slug: createSlug(parsed.slug),
                projectId: Number(parsed.projectId),
            },
        });

        return new Response(JSON.stringify(newPlatform), { status: 201 });

    } catch (error: any) {
        console.error("Create platform failed:", error)
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}