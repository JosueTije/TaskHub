// before controller // buscar token y validar que todo correctooou! + extraer usuario y guardar esos datos!

const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

module.exports = {
  requireAuth,
};