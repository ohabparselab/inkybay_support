import { prisma } from "~/lib/prisma.server";

export async function loader({ params }: { params: any }) {
    try {
        const clientId = Number(params.clientId);
        if (!clientId) return new Response(JSON.stringify({ message: "ClientId ID required" }), { status: 400 });
        const clientEmails = await prisma.clientEmail.findMany({
            where: {
                clientId: clientId,
            }
        })

        return Response.json({
            success: true,
            clientEmails
        });
    } catch (error: any) {
        console.error("Error fetching :", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}