import { addTaskSchema } from "~/lib/validations";
import { prisma } from "~/lib/prisma.server";

export async function action({ request, params }: { request: Request; params: any }) {

    const taskId = Number(params.taskId);
    if (!taskId) return new Response(JSON.stringify({ message: "Task ID required" }), { status: 400 });

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateTask(taskId, request);
        case "DELETE":
            return await deleteTaskHard(taskId);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

export const updateTask = async (taskId: number, request: Request) => {
    try {

        const data = await request.json();

        if (data.taskAddedDate) {
            data.taskAddedDate = new Date(data.taskAddedDate);
        }

        const value = addTaskSchema.parse(data);

        const providedBy = value.providedBy ? Number(value.providedBy) : null;
        const solvedBy = value.solvedBy ? Number(value.solvedBy) : null;
        const statusId = value.taskStatus ? Number(value.taskStatus) : null;

        // Validate IDs
        if (!taskId) {
            return Response.json({ success: false, message: "Task ID is required." }, { status: 400 });
        }

        // if (!value.clientId) {
        //     return Response.json({ success: false, message: "Client ID is required." }, { status: 400 });
        // }

        if (!providedBy) {
            return Response.json({ success: false, message: "Please select Provided By (User)." }, { status: 400 });
        }

        if (!statusId) {
            return Response.json({ success: false, message: "Please select status." }, { status: 400 });
        }

        // Prepare update data
        const updateData: any = {
            taskDetails: value.taskDetails,
            storePassword: value.storePassword,
            storeAccess: value.storeAccess,
            taskAddedDate: value.taskAddedDate ? new Date(value.taskAddedDate) : null,
            reply: value.reply,
            comments: value.comments,
            updatedAt: new Date(),
            // client: { connect: { id: Number(value.clientId) } },
            providedByUser: { connect: { id: providedBy } },
            status: { connect: { id: statusId } },
        };

        // Optional solvedByUser
        if (solvedBy) {
            updateData.solvedByUser = { connect: { id: solvedBy } };
        } else {
            updateData.solvedByUser = { disconnect: true };
        }



        // Update task
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData
        });

        // Update client emails if provided
        if (value?.emails && value?.emails?.length > 0 && updatedTask.clientId) {
            // Fetch existing emails for the client
            const existingEmails = await prisma.clientEmail.findMany({
                where: { clientId: updatedTask.clientId },
            });

            const existingSet = new Set(existingEmails.map((e) => e.email));
            const newSet = new Set(value?.emails);

            // ➕ Add new emails
            for (const email of value?.emails) {
                if (!existingSet.has(email)) {
                    await prisma.clientEmail.create({
                        data: { clientId: updatedTask.clientId, email },
                    });
                }
            }

            // Hard delete removed emails
            for (const existing of existingEmails) {
                if (!newSet.has(existing.email)) {
                    await prisma.clientEmail.delete({
                        where: { id: existing.id },
                    });
                }
            }
        }

        return Response.json({
            success: true,
            message: "Task updated successfully.",
            chat: updatedTask,
        }, {status: 200});

    } catch (error: any) {
        console.error("Update task failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};

export const deleteTaskHard = async (taskId: number) => {
    try {

        // Delete chat itself
        await prisma.task.delete({ where: { id: taskId } });

        return Response.json({ success: true, message: "Task permanently deleted." });
    } catch (error: any) {
        console.error("Hard delete task failed:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
};
