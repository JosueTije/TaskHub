
// controllersss !! recibir request -> validar -> serviceee!

const { createUserByAdmin } = require("../services/admin.service");

async function createUser(req, res) {
  try {
    const { email, fullName, role, temporaryPassword } = req.body;

    if (!email || !fullName || !role || !temporaryPassword) {
      return res.status(400).json({
        message: "email, fullName, role y temporaryPassword son obligatorios",
      });
    }

    const user = await createUserByAdmin({
      email,
      fullName,
      role,
      temporaryPassword,
    });

    return res.status(201).json({
      message: "Usuario creado correctamente y OTP enviado al correo",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al crear usuario",
    });
  }
}

module.exports = {
  createUser,
};