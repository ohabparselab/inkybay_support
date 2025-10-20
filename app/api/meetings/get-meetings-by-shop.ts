
import { prisma } from "~/lib/prisma.server";

export async function action({ request }: { request: Request }) {
    try {
        const formData = await request.formData();
        const shopUrl = String(formData.get('shop'));

        if (!shopUrl) {
            return Response.json({ status: 404, message: "Shop Url not found" });
        }

        // Fetch meetings for that client
        const meetings = await prisma.meeting.findMany({
            where: {
                storeUrl: { contains: shopUrl},
                isDeleted: false,
            },
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                emails: { select: { email: true } },
            },
        });

        return Response.json({ status: 200, data: meetings });
    } catch (error: any) {
        console.error("meetings by shop fetch error:", error);
        return Response.json({ status: 500, message: error.message });
    }
}
