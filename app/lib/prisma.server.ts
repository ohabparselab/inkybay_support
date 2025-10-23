import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.PARSETRACK_NODE_ENV === "beta" ? process.env.PARSETRACK_BETA_DATABASE_URL : process.env.PARSETRACK_NODE_ENV === "production" ? process.env.PARSETRACK_LIVE_DATABASE_URL : process.env.DATABASE_URL;

console.log("==========databaseUrl=====>>", databaseUrl);

let prisma: PrismaClient;

declare global {
    var __db__: PrismaClient | undefined;
}

if (!global.__db__) {
    global.__db__ = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
}

prisma = global.__db__;

export { prisma };
