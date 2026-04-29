const { getActiveUsers } = require("../services/user.service");

async function getUsersController(req, res) {
  try {
    const users = await getActiveUsers();

    return res.status(200).json({
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener usuarios",
    });
  }
}

const getDevelopers = async (req, res) => {
  try {
    const developers = await prisma.user.findMany({
      where: {
        role: "DEVELOPER",
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    res.json({ developers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener developers" });
  }
};
const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "El userId es obligatorio" });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        leftAt: null,
      },
    });

    if (existingMember) {
      return res.status(400).json({ message: "Este usuario ya pertenece al proyecto" });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: user.role,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Developer agregado correctamente al proyecto",
      member,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al agregar developer al proyecto" });
  }
};

module.exports = {
  getUsersController,
};