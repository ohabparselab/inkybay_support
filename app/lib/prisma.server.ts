import { PrismaClient } from "@prisma/client";

const env = process.env.PARSETRACK_NODE_ENV;
let databaseUrl: string | undefined;

if (env === "beta") {
    databaseUrl = process.env.PARSETRACK_BETA_DATABASE_URL;
} else if (env === "production") {
    databaseUrl = process.env.PARSETRACK_LIVE_DATABASE_URL;
} else {
    databaseUrl = process.env.DATABASE_URL;
}

if (!databaseUrl) {
    throw new Error("❌ DATABASE_URL is not defined for the current environment");
}

declare global {
    var __db__: PrismaClient | undefined;
}

export const prisma =
    global.__db__ ?? new PrismaClient({ datasources: { db: { url: databaseUrl } } });

if (process.env.NODE_ENV !== "production") global.__db__ = prisma;
