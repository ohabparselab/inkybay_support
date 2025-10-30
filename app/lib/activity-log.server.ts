import { prisma } from "./prisma.server";

interface LogActivity {
    userId?: number;
    desc?: string;
    action?: "CREATE" | "UPDATE" | "DELETE" | "COMMENT" | "REVIEW";
    modelName?: string;
    recordId?: number;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
}

export async function logActivity({
    userId,
    desc,
    action,
    modelName,
    recordId,
    changes,
    metadata,
}: LogActivity) {
    await prisma.activityLog.create({
        data: {
            userId,
            desc,
            action,
            modelName,
            recordId,
            changes,
            metadata,
        },
    });
}
