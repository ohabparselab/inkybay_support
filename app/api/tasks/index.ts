import { addTaskSchema } from "~/lib/validations"
import { prisma } from "~/lib/prisma.server"


const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })

//  MAIN CONTROLLER HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase()
    switch (method) {
        // case "GET":
        //     return await getAllTasks(request)
        case "POST":
            return await createTask(request)
        // case "PUT":
        //     return await updateProfile(request)
        // case "PATCH":
        //     return await changePassword(request)
        default:
            return methodNotAllowed()
    }
}

//
// [GET] Fetch all tasks
//
const getAllTasks = async (_request: Request) => {
    try {
        const tasks = await prisma.task.findMany({})

        return Response.json({ success: true, tasks })
    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}

//
// [POST] Create new task
//
const createTask = async (request: Request) => {
    try {
        const data = await request.json();

        if (data.taskAddedDate) {
            data.taskAddedDate = new Date(data.taskAddedDate);
        }
        const value = addTaskSchema.parse(data);

        const providedBy = value.providedBy ? Number(value.providedBy) : null;
        const solvedBy = value.solvedBy ? Number(value.solvedBy) : null;

        // Validate required foreign keys
        if (!value.clientId) {
            return Response.json({ success: false, message: "Client ID is required." }, { status: 400 });
        }

        if (!providedBy) {
            return Response.json({ success: false, message: "Please select Provided By (User)." }, { status: 400 });
        }

        // Build clean taskData
        const taskData: any = {
            taskDetails: value.taskDetails,
            taskStatus: value.taskStatus,
            storePassword: value.storePassword,
            storeAccess: value.storeAccess,
            taskAddedDate: value.taskAddedDate ? new Date(value.taskAddedDate) : null,
            reply: value.reply,
            comments: value.comments,
            // relations below
            client: { connect: { id: Number(value.clientId) } },
            providedByUser: { connect: { id: providedBy } },
        };

        // Connect solvedBy only if provided
        if (solvedBy) {
            taskData.solvedByUser = { connect: { id: solvedBy } };
        }

         if (value?.emails && value?.emails.length > 0) {
            for (const email of value.emails) {
                const exists = await prisma.clientEmail.findUnique({
                    where: { clientId: value.clientId, email } ,
                });
                if (!exists) {
                    await prisma.clientEmail.create({
                        data: { clientId: value.clientId, email },
                    });
                }
            }
        }

        // Create the task with relationships
        const task = await prisma.task.create({
            data: taskData,
            include: {
                providedByUser: true,
                solvedByUser: true,
                client: true,
            },
        });

        return Response.json({
            success: true,
            message: "Task created successfully.",
            task,
        });
    } catch (error: any) {
        console.error("Create task failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
