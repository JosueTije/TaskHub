const { getActiveUsers, updateUser, deleteUser, updateUserStatus, resetUserPassword, getUserMetrics } = require("../services/user.service");
const prisma = require("../config/prisma");

async function getUsersController(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const result = await getActiveUsers({ page, limit, search });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios" });
  }
}

async function getDevelopers(req, res) {
  try {
    const developers = await prisma.user.findMany({
      where: {
        role: "DEVELOPER",
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        status: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    return res.status(200).json({ developers });
  } catch (error) {
    console.error("ERROR GET DEVELOPERS:", error);

    return res.status(500).json({
      message: "Error al obtener developers",
      error: error.message,
    });
  }
}
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

async function updateUserController(req, res) {
  try {
    const { userId } = req.params;
    const { fullName, role } = req.body;
    const user = await updateUser({ userId, fullName, role });
    return res.status(200).json({ message: "Usuario actualizado correctamente", user });
  } catch (error) {
    const status = error.message === "Usuario no encontrado" ? 404 : 400;
    return res.status(status).json({ message: error.message || "Error al actualizar usuario" });
  }
}

async function deleteUserController(req, res) {
  try {
    const { userId } = req.params;
    await deleteUser({ userId, currentUserId: req.user.sub });
    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    const status = error.message === "Usuario no encontrado" ? 404 : 400;
    return res.status(status).json({ message: error.message || "Error al eliminar usuario" });
  }
}

async function updateUserStatusController(req, res) {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const user = await updateUserStatus({ userId, currentUserId: req.user.sub, status });
    return res.status(200).json({ message: "Estado actualizado correctamente", user });
  } catch (error) {
    const status = error.message === "Usuario no encontrado" ? 404 : 400;
    return res.status(status).json({ message: error.message || "Error al actualizar estado" });
  }
}

async function resetUserPasswordController(req, res) {
  try {
    const { userId } = req.params;
    const result = await resetUserPassword({ userId });
    return res.status(200).json({ message: "Contraseña reseteada correctamente", ...result });
  } catch (error) {
    const status = error.message === "Usuario no encontrado" ? 404 : 400;
    return res.status(status).json({ message: error.message || "Error al resetear contraseña" });
  }
}

async function getUserMetricsController(req, res) {
  try {
    const { userId } = req.params;
    const metrics = await getUserMetrics({ userId });
    return res.status(200).json({ metrics });
  } catch (error) {
    const status = error.message === "Usuario no encontrado" ? 404 : 500;
    return res.status(status).json({ message: error.message || "Error al obtener métricas" });
  }
}

module.exports = {
  getUsersController,
  getDevelopers,
  addProjectMember,
  updateUserController,
  deleteUserController,
  updateUserStatusController,
  resetUserPasswordController,
  getUserMetricsController,
};