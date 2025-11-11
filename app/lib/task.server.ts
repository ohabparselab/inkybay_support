import { prisma } from "./prisma.server";

export async function getTaskInfoById(taskId: number): Promise<any> {

    try {

        if (!taskId) return false;
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        return task;

    } catch (error) {
        console.error("error getting task info by ID")
    }


}