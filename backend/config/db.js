const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// Create the PostgreSQL adapter using our Neon connection string.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Create one Prisma Client instance for the whole application.
const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;
