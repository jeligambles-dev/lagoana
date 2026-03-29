import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash("LaGoana2026", 12);

  await prisma.user.upsert({
    where: { email: "admin@lagoana.ro" },
    update: { passwordHash, name: "Admin Lagoana" },
    create: {
      email: "admin@lagoana.ro",
      name: "Admin Lagoana",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin account updated: admin@lagoana.ro / LaGoana2026");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
