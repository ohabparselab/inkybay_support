import { uploadFile } from "~/lib/upload.server"
import { prisma } from "~/lib/prisma.server"
import { addMarketingFunnelSchema } from "~/lib/validations"

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
export const createMarketingFunnel = async (request: Request) => {
    try {
        const value = await request.json();

        if (!value.clientId) {
            return Response.json({ success: false, message: "Client ID not found." }, { status: 400 });
        }

        // 🧾 Create marketing funnel
        const funnel = await prisma.marketingFunnel.create({
            data: {
                clientId: value.clientId,
                installPhase: value.installPhase,
                typeOfProducts: value.typeOfProducts,
                otherAppsInstalled: value.otherAppsInstalled,
                customizationType: value.customizationType,
                initialFeedback: value.initialFeedback,
                clientSuccessStatus: value.clientSuccessStatus,
            },
        });

        // Save emails (check duplicates)
        if (Array.isArray(value.emails) && value.emails.length > 0) {
            for (const email of value.emails) {
                const exists = await prisma.clientEmail.findUnique({
                    where: { clientId: value.clientId, email  },
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

        // Save follow-up dates
        if (Array.isArray(value.followUps) && value.followUps.length > 0) {
            const followUpData = value.followUps.map((date: string) => ({
                marketingFunnelId: funnel.id,
                followUpDate: new Date(date),
            }));

            await prisma.followUp.createMany({
                data: followUpData,
            });
        }

        return Response.json({ success: true, message: "Marketing Funnel created successfully.", data: funnel });
    } catch (error: any) {
        console.error(" Create Marketing Funnel failed:", error);
        return Response.json({ success: false, message: error.message || "Internal server error." }, { status: 500 });
    }
};