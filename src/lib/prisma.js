import { PrismaClient } from "@prisma/client";

// Crie uma instância do PrismaClient
const prisma = new PrismaClient();

// Exporte o PrismaClient para ser utilizado em outras partes do código
export { prisma };
