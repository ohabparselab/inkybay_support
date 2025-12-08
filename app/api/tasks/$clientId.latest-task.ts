import { prisma } from "~/lib/prisma.server";

export async function loader({ params }: { params: any }) {
    try {
        const clientId = Number(params.clientId);
        if (!clientId) return new Response(JSON.stringify({ message: "ClientId ID required" }), { status: 400 });
        const task = await prisma.task.findFirst({
            where: {
                clientId: clientId
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
                project: { select: { id: true, name: true } },
            },
        })

        return Response.json({
            success: true,
            task
        });
    } catch (error: any) {
        console.error("Error fetching latest client task:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}