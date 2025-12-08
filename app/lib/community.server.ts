import { prisma } from "./prisma.server";

export async function getCommunityInfoById(id: number): Promise<any> {

    try {

        if (!id) return false;
        const community = await prisma.community.findUnique({
            where: { id: id }
        });

        return community;

    } catch (error) {
        console.error("error getting task info by ID")
    }


}