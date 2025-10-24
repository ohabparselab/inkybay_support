import { addProjectSchema } from "~/lib/validations";
import { createSlug } from "~/lib/helper.sever";
import { prisma } from "~/lib/prisma.server";


export const loader = async ({ request }: { request: Request }) => {

    const projects = await prisma.project.findMany({
        include: {
            platforms: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    // Transform into structure for <SelectGroup>
    const projectsPlatforms = projects.map((project) => ({
        projectName: project.name,
        platforms: project.platforms.map((p) => ({
            id: p.id,
            name: p.name,
            value: `${project.id}-${p.id}`,
        })),
    }));

    return { projects: projectsPlatforms }

}

export const action = async ({ request }: { request: Request }) => {

    switch (request.method.toUpperCase()) {
        // case "GET":
        //     return await getAllProjects(request);
        case "POST":
            return await createProject(request);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

// get all projects list
const getAllProjects = async (request: Request) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                platforms: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        // Transform into structure for <SelectGroup>
        const projectsPlatforms = projects.map((project) => ({
            projectName: project.name,
            platforms: project.platforms.map((p) => ({
                id: p.id,
                name: p.name,
                value: `${project.id}-${p.id}`,
            })),
        }));

        return { projects: projectsPlatforms }

    } catch (error: any) {
        console.error("Fail to get all failed:", error)
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}

// create project
const createProject = async (request: Request) => {
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