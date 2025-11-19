import { prisma } from "~/lib/prisma.server";

export async function loader({ params }: { params: any }) {
    try {
        const clientId = Number(params.clientId);
        if (!clientId) return new Response(JSON.stringify({ message: "ClientId ID required" }), { status: 400 });
        const chat = await prisma.chat.findFirst({
            where: {
                clientId: clientId,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        shopDomain: true,
                        shopName: true,
                        clientEmail: { select: { id: true, email: true } },
                    },
                },
                handleByUser: { select: { id: true, fullName: true, email: true } },
                createdByUser: { select: { id: true, fullName: true } },
                updatedByUser: { select: { id: true, fullName: true } },
                chatTags: { include: { tag: { select: { name: true } } } },
                review: { include: { approachByUser: true } },
                project: { select: { name: true } },
                featureRequest: true,
            },
            orderBy: { createdAt: "desc" }
        })

        return Response.json({
            success: true,
            chat
        });
    } catch (error: any) {
        console.error("Error fetching tasks:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}