import { prisma } from "./prisma.server";

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE" | "COMMENT" | "REVIEW";

interface LogActivity {
    userId?: number;
    desc?: string;
    action?: ActivityAction;
    modelName?: string;
    recordId?: number;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
}

export async function ActivityLog({
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
