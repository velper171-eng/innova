import { PrismaClient } from "@prisma/client";

console.log("Prisma Client loading... DATABASE_URL defined:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const masked = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
  console.log("DATABASE_URL:", masked);
}

const prisma = new PrismaClient();

export default prisma;
