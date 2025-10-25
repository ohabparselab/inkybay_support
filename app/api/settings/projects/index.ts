import type { LoaderFunctionArgs } from "react-router";
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

export async function loader({ request }: LoaderFunctionArgs) {

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

    return Response.json({ projects: projectsPlatforms });

}

// const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })

// export const action = async ({ request }: { request: Request }) => {
//     try {
//         const data = await request.json()
//         const parsed = addProjectSchema.parse(data);

//         const project = await prisma.project.create({
//             data: {
//                 name: parsed.name,
//                 slug: createSlug(parsed.slug),
//             },
//         });

//         return Response.json({ success: true, message: "Project created successfully.", project }, { status: 201 })
//     } catch (error: any) {
//         console.error("Create project failed:", error)
//         return Response.json({ success: false, message: error.message }, { status: 500 })
//     }
// }

// // get all projects list
// const getAllProjects = async (request: Request) => {
//     try {
//         const projects = await prisma.project.findMany({
//             include: {
//                 platforms: true,
//             },
//             orderBy: {
//                 name: "asc",
//             },
//         });

//         // Transform into structure for <SelectGroup>
//         const projectsPlatforms = projects.map((project) => ({
//             projectName: project.name,
//             platforms: project.platforms.map((p) => ({
//                 id: p.id,
//                 name: p.name,
//                 value: `${project.id}-${p.id}`,
//             })),
//         }));

//         return Response.json({ projects: projectsPlatforms });

//     } catch (error: any) {
//         console.error("Fail to get all failed:", error)
//         return Response.json({ success: false, message: error.message }, { status: 500 })
//     }
// }

// // create project
// const createProject = async (request: Request) => {
//     try {
//         const data = await request.json()
//         const parsed = addProjectSchema.parse(data);

//         const project = await prisma.project.create({
//             data: {
//                 name: parsed.name,
//                 slug: createSlug(parsed.slug),
//             },
//         });

//         return Response.json({ success: true, message: "Project created successfully.", project }, { status: 201 })
//     } catch (error: any) {
//         console.error("Create project failed:", error)
//         return Response.json({ success: false, message: error.message }, { status: 500 })
//     }
// }