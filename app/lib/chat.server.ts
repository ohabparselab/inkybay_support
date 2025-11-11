import { prisma } from "./prisma.server";

export async function getChatInfoById(chatId: number):Promise<any> {
    
    if (!chatId) return false;
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
         include: {
                createdByUser: { select: { id: true, fullName: true } },
         }
    });

    return chat;
}