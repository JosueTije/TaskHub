const prisma = require("../config/prisma");
const {
  comparePassword,
  hashPassword,
  validatePasswordStrength,
} = require("../utils/password");
const { compareOtp } = require("../utils/otp");
const {
  signAccessToken,
  signOtpSessionToken,
  verifyToken,
} = require("../utils/jwt");

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Credenciales inválidas");
  }

  if (user.status === "INACTIVE") {
    throw new Error("Usuario inactivo");
  }

  if (user.mustChangePassword) {
    return {
      requiresOtp: true,
      message: "Primer acceso: debes validar tu OTP",
      otpToken: signOtpSessionToken({
        sub: user.id,
        email: user.email,
        purpose: "FIRST_ACCESS_OTP",
      }),
    };
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    requiresOtp: false,
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
}

async function verifyFirstAccessOtp({ otpToken, otp }) {
  const payload = verifyToken(otpToken);

  if (payload.purpose !== "FIRST_ACCESS_OTP") {
    throw new Error("Token inválido");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const userOtp = await prisma.userOtp.findFirst({
    where: {
      userId: user.id,
      type: "ACCOUNT_SETUP",
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!userOtp) {
    throw new Error("No hay OTP disponible");
  }

  if (userOtp.expiresAt < new Date()) {
    throw new Error("El OTP expiró");
  }

  const isValidOtp = await compareOtp(otp, userOtp.codeHash);

  if (!isValidOtp) {
    throw new Error("OTP inválido");
  }

  const setupPasswordToken = signOtpSessionToken({
    sub: user.id,
    email: user.email,
    purpose: "SET_NEW_PASSWORD",
  });

  return {
    setupPasswordToken,
  };
}

async function setNewPassword({ setupPasswordToken, newPassword }) {
  const payload = verifyToken(setupPasswordToken);

  if (payload.purpose !== "SET_NEW_PASSWORD") {
    throw new Error("Token inválido");
  }

  if (!validatePasswordStrength(newPassword)) {
    throw new Error(
      "La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo"
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false,
        status: "ACTIVE",
      },
    });

    await tx.userOtp.updateMany({
      where: {
        userId: user.id,
        type: "ACCOUNT_SETUP",
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  });

  return {
    message: "Contraseña actualizada correctamente",
  };
}

module.exports = {
  login,
  verifyFirstAccessOtp,
  setNewPassword,
};