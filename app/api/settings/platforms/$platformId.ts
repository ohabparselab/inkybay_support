import { createSlug } from "~/lib/helper.sever";
import { prisma } from "~/lib/prisma.server";

export async function action({ request, params }: { request: Request; params: any }) {
    const platformId = Number(params.platformId);
    if (!platformId){
        return Response.json({ message: "Platform ID required" }, { status: 400 });
    }

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updatePlatform(platformId, request);
        case "DELETE":
            return await deletePlatformHard(platformId);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), {
                status: 405,
            });
    }
}

// Update Platform
async function updatePlatform(platformId: number, request: Request) {
    try {
        const body = await request.json();
        const { name, slug, projectId } = body;

        if (!name || !slug) {
            return new Response(JSON.stringify({ message: "Name and Slug are required" }), {
                status: 400,
            });
        }

        const updatedPlatform = await prisma.platform.update({
            where: { id: platformId },
            data: {
                name,
                slug: createSlug(slug),
                projectId: projectId ? Number(projectId) : undefined,
            },
        });

        return new Response(JSON.stringify(updatedPlatform), { status: 200 });
    } catch (err) {
        console.error("Update Platform Error:", err);
        return new Response(
            JSON.stringify({ message: "Failed to update platform" }),
            { status: 500 }
        );
    }
}

// Hard Delete Platform
async function deletePlatformHard(platformId: number) {
    try {
        await prisma.platform.delete({ where: { id: platformId } });
        return new Response(
            JSON.stringify({ message: "Platform deleted successfully" }),
            { status: 200 }
        );
    } catch (err) {
        console.error("Delete Platform Error:", err);
        return new Response(
            JSON.stringify({ message: "Failed to delete platform" }),
            { status: 500 }
        );
    }
}
