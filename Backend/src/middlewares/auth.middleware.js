const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;

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