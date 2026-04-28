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

module.exports = {
  getUsersController,
};