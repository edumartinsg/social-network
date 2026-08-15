import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient({
//   log: NODE_ENV == "dev" ? ["query"] : [],
})
