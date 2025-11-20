import { prisma } from "~/lib/prisma.server";

export async function loader({ params }: { params: any }) {
    try {
        const storeUrl = String(params.storeUrl);
        if (!storeUrl) return new Response(JSON.stringify({ message: "Shore url required" }), { status: 400 });
        const clientEmails = await prisma.meetingEmail.findMany({
            where: {
                AND: [
                    { meeting: {storeUrl: { contains: storeUrl }} }
                ],
            },
            orderBy: { id: "desc" },
            include: {
                meeting: true
            },
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