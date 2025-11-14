import { connect } from "http2"
import { prisma } from "~/lib/prisma.server"

const methodNotAllowed = () => Response.json({ message: "Method Not Allowed" }, { status: 405 })

//  MAIN CONTROLLER HANDLER
export const action = async ({ request }: { request: Request }) => {
    const method = request.method.toUpperCase()
    switch (method) {
        case "GET":
            return await getAllMarketingFunnels(request)
        case "POST":
            return await createMarketingFunnel(request)
        default:
            return methodNotAllowed()
    }
}

//
// [GET] Fetch all marketing funnels
//
const getAllMarketingFunnels = async (_request: Request) => {
    try {
        const meetings = await prisma.marketingFunnel.findMany({});

        return Response.json({ success: true, meetings })
    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })

    }
}

//
// [POST] Create new marketing funnels
//
const createMarketingFunnel = async (request: Request) => {
    try {
        const value = await request.json();

        if (!value.clientId) {
            return Response.json({ success: false, message: "Client ID not found." }, { status: 400 });
        }

        if (Array.isArray(value.followUps) && value.followUps.length > 0) {
            // Helper to convert '5th', '6th', etc. to numbers for sorting
            const stepToNumber = (step: string) => parseInt(step, 10);

            // Sort follow-ups by numeric step (ascending)
            const sortedFollowUps = value.followUps.sort(
                (a: any, b: any) => stepToNumber(a.followUpStep) - stepToNumber(b.followUpStep)
            );

            // Find the last follow-up (latest phase)
            const lastIndex = sortedFollowUps.length - 1;

            for (const [index, followUp] of sortedFollowUps.entries()) {
                const funnelId = Number(followUp.funnelId) || 0;

                const funnelParams:any = {
                    clientId: value.clientId,
                    projectId: Number(value.projectId),
                    typeOfProducts: value.typeOfProducts,
                    customizationType: value.customizationType,
                    followUpStep: followUp.followUpStep,
                    followUpDate: followUp.followUpDate,
                    installPhase: followUp.installPhase,
                    otherAppsInstalled: followUp.otherAppsInstalled,
                    initialFeedback: followUp.initialFeedback,
                    clientSuccessStatus: followUp.clientSuccessStatus,
                    currentPhase: index === lastIndex,
                };

                await prisma.marketingFunnel.upsert({
                    where: { id: funnelId, clientId: value.clientId },
                    update: funnelParams,
                    create: funnelParams,
                });
            }
        }


        // Save emails (check duplicates)
        if (Array.isArray(value.emails) && value.emails.length > 0) {
            for (const email of value.emails) {
                const exists = await prisma.clientEmail.findUnique({
                    where: { clientId: value.clientId, email },
                });

                if (!exists) {
                    await prisma.clientEmail.create({
                        data: {
                            clientId: value.clientId,
                            email,
                        },
                    });
                }
            }
        }

        return Response.json({ success: true, message: "Marketing Funnel save successfully." });
    } catch (error: any) {
        console.error(" Create Marketing Funnel failed:", error);
        return Response.json({ success: false, message: error.message || "Internal server error." }, { status: 500 });
    }
};