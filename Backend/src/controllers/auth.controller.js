const {
  login,
  verifyFirstAccessOtp,
  setNewPassword,
} = require("../services/auth.service");

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email y password son obligatorios",
      });
    }

    const result = await login({ email, password });

res.cookie("token", result.accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al iniciar sesión",
    });
  }
}

async function verifyOtpController(req, res) {
  try {
    const { otpToken, otp } = req.body;

    if (!otpToken || !otp) {
      return res.status(400).json({
        message: "otpToken y otp son obligatorios",
      });
    }

    const result = await verifyFirstAccessOtp({ otpToken, otp });

    return res.status(200).json({
      message: "OTP válido",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al validar OTP",
    });
  }
}

async function setNewPasswordController(req, res) {
  try {
    const { setupPasswordToken, newPassword } = req.body;

    if (!setupPasswordToken || !newPassword) {
      return res.status(400).json({
        message: "setupPasswordToken y newPassword son obligatorios",
      });
    }

    const result = await setNewPassword({
      setupPasswordToken,
      newPassword,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Error al actualizar contraseña",
    });
  }
}

async function logoutController(req, res) {
  try {
res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
    return res.status(200).json({
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al cerrar sesión",
    });
  }
}

module.exports = {
  loginController,
  verifyOtpController,
  setNewPasswordController,
  logoutController,
};