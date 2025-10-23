import { PrismaClient } from "@prisma/client";

console.log("=====PARSETRACK_NODE_ENV====>>", process.env.PARSETRACK_NODE_ENV);

let prisma: PrismaClient;

declare global {
  var __db__: PrismaClient | undefined;
}

if (!global.__db__) {
  global.__db__ = new PrismaClient();
}

prisma = global.__db__;

export { prisma };
