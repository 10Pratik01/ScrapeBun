// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }

  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = global.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;
