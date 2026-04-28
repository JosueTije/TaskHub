const prisma = require("../config/prisma");

async function getActiveUsers() {
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      avatarUrl: true,
      status: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return users;
}

module.exports = {
  getActiveUsers,
};