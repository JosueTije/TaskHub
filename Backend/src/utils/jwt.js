//auxiliares

const jwt = require("jsonwebtoken");

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

function signOtpSessionToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function signPasswordResetToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const decoded = jwt.decode(token);

    console.log("JWT VERIFY ERROR:", error.message);
    console.log("JWT DECODED:", decoded);
    console.log("SERVER NOW (unix):", Math.floor(Date.now() / 1000));
    console.log("SERVER NOW (iso):", new Date().toISOString());

    throw error;
  }
}

module.exports = {
  signAccessToken,
  signOtpSessionToken,
  signPasswordResetToken,
  verifyToken,
};