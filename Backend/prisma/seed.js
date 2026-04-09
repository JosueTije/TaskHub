require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedAdmin = await bcrypt.hash("Admin123!", 10);
  const hashedPM = await bcrypt.hash("PM123!", 10);
  const hashedDev = await bcrypt.hash("Dev123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@taskhub.com" },
    update: {},
    create: {
      email: "admin@taskhub.com",
      passwordHash: hashedAdmin,
      fullName: "Admin TaskHub",
      role: "ADMIN",
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  await prisma.user.upsert({
    where: { email: "pm@taskhub.com" },
    update: {},
    create: {
      email: "pm@taskhub.com",
      passwordHash: hashedPM,
      fullName: "PM TaskHub",
      role: "PM",
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  await prisma.user.upsert({
    where: { email: "dev@taskhub.com" },
    update: {},
    create: {
      email: "dev@taskhub.com",
      passwordHash: hashedDev,
      fullName: "Developer TaskHub",
      role: "DEVELOPER",
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  console.log("Usuarios demo creados");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });