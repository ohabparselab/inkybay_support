
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: { request: Request }) {
    try {
        const formData = await request.formData();
        const clientId = Number(formData.get('clientId'));

        if (!clientId) {
            return Response.json({ status: 404, message: "Client not found" });
        }

        // Fetch tasks for that client
        const tasks = await prisma.task.findMany({
            where: {
                clientId: clientId,
                isDeleted: false,
            },
            orderBy: { createdAt: "desc" },
            include: {
                client: {
                    select: {
                        id: true, shopDomain: true, shopName: true,
                        clientEmail: {
                            select: { id: true, email: true },
                        },
                    },
                },
                providedByUser: { select: { id: true, fullName: true } },
                solvedByUser: { select: { id: true, fullName: true } },
                status: { select: { id: true, name: true } },
            }
        });

        return Response.json({ status: 200, data: tasks });
    } catch (error: any) {
        console.error("tasks fetch error:", error);
        return Response.json({ status: 500, message: error.message });
    }
}
