import { prisma } from "~/lib/prisma.server"

export async function action({ request, params }: { request: Request; params: any }) {

    const mfId = Number(params.mfId);
    if (!mfId) return new Response(JSON.stringify({ message: "Task ID required" }), { status: 400 });

    switch (request.method.toUpperCase()) {
        case "PUT":
            return await updateMarketingFunnel(mfId, request);
        case "DELETE":
            return await deleteMarketingFunnelHard(mfId);
        default:
            return new Response(JSON.stringify({ message: "Method not allowed" }), { status: 405 });
    }
}

export const updateMarketingFunnel = async (mfId: number, request: Request) => {
    try {
        const value = await request.json();

        // Validate funnel ID
        if (!mfId) {
            return Response.json({ success: false, message: "Marketing Funnel ID not provided." }, { status: 400 });
        }

        // Check if the funnel exists
        const existingFunnel = await prisma.marketingFunnel.findUnique({
            where: { id: mfId },
            include: { followUps: true, client: { include: { clientEmail: true } } },
        });

        if (!existingFunnel) {
            return Response.json({ success: false, message: "Marketing Funnel not found." }, { status: 404 });
        }

        // Update main funnel fields
        const updatedFunnel = await prisma.marketingFunnel.update({
            where: { id: mfId },
            data: {
                installPhase: value.installPhase,
                typeOfProducts: value.typeOfProducts,
                otherAppsInstalled: value.otherAppsInstalled,
                customizationType: value.customizationType,
                initialFeedback: value.initialFeedback,
                clientSuccessStatus: value.clientSuccessStatus,
            },
        });

        // Update emails
        if (Array.isArray(value.emails)) {
            const existingEmails = existingFunnel.client.clientEmail.map(e => e.email);

            // Add new emails
            for (const email of value.emails) {
                if (!existingEmails.includes(email)) {
                    await prisma.clientEmail.create({
                        data: {
                            clientId: existingFunnel.clientId,
                            email,
                        },
                    });
                }
            }

            // remove emails that are no longer in the list
            for (const email of existingEmails) {
                if (!value.emails.includes(email)) {
                    await prisma.clientEmail.deleteMany({
                        where: { clientId: existingFunnel.clientId, email },
                    });
                }
            }
        }

        // Update follow-ups
        if (Array.isArray(value.followUps)) {
            // Delete existing follow-ups
            await prisma.followUp.deleteMany({
                where: { marketingFunnelId: mfId },
            });

            // Add new follow-ups
            const followUpData = value.followUps.map((date: string) => ({
                marketingFunnelId: mfId,
                followUpDate: new Date(date),
            }));
            if (followUpData.length > 0) {
                await prisma.followUp.createMany({ data: followUpData });
            }
        }

        return Response.json({
            success: true,
            message: "Marketing Funnel updated successfully.",
            data: updatedFunnel,
        });
    } catch (error: any) {
        console.error("Update Marketing Funnel failed:", error);
        return Response.json({ success: false, message: error.message || "Internal server error." }, { status: 500 });
    }
};


export const deleteMarketingFunnelHard = async (funnelId: number) => {
    try {
        if (!funnelId) {
            return Response.json({ success: false, message: "Funnel ID is required." }, { status: 400 });
        }

        // Delete all follow-ups associated with this funnel
        await prisma.followUp.deleteMany({
            where: { marketingFunnelId: funnelId },
        });

        // Delete the funnel itself
        await prisma.marketingFunnel.delete({
            where: { id: funnelId },
        });

        return Response.json({ success: true, message: "Marketing Funnel permanently deleted." });
    } catch (error: any) {
        console.error("Hard delete Marketing Funnel failed:", error);
        return Response.json({ success: false, message: error.message || "Internal server error." }, { status: 500 });
    }
};

