import { createSlug } from "~/lib/helper.sever";
import { prisma } from "~/lib/prisma.server";

export async function action({ request, params }: { request: Request; params: any }) {

    const projectId = Number(params.projectId);
    if (!projectId) return Response.json({ message: "Project ID required" }, {status:400});

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateProject(projectId, request);
        case "DELETE":
            return await deleteProjectHard(projectId);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

async function updateProject(projectId: number, request: Request) {
    try {
        const body = await request.json();
        const { name, slug } = body;

        if (!name || !slug) {
            return new Response(JSON.stringify({ message: "Name and Slug are required" }), { status: 400 });
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { name, slug: createSlug(slug) },
        });

        return new Response(JSON.stringify(updatedProject), { status: 200 });
    } catch (err) {
        console.error("Update Project Error:", err);
        return new Response(JSON.stringify({ message: "Failed to update project" }), { status: 500 });
    }
}

async function deleteProjectHard(projectId: number) {
    try {
        await prisma.project.delete({ where: { id: projectId } });
        return new Response(JSON.stringify({ message: "Project deleted successfully" }), { status: 200 });
    } catch (err) {
        console.error("Delete Project Error:", err);
        return new Response(JSON.stringify({ message: "Failed to delete project" }), { status: 500 });
    }
}
