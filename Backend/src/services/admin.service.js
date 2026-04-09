const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/password");
const { generateOtp, hashOtp, getOtpExpiration } = require("../utils/otp");
const { sendOtpEmail } = require("../config/mailer");

async function createUserByAdmin({ email, fullName, role, temporaryPassword }) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Ya existe un usuario con ese correo");
  }

  const passwordHash = await hashPassword(temporaryPassword);
  const otp = generateOtp();
  const codeHash = await hashOtp(otp);
  const expiresAt = getOtpExpiration(10);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email,
        fullName,
        role,
        passwordHash,
        status: "PENDING_SETUP",
        mustChangePassword: true,
      },
    });

    await tx.userOtp.updateMany({
      where: {
        userId: createdUser.id,
        type: "ACCOUNT_SETUP",
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.userOtp.create({
      data: {
        userId: createdUser.id,
        type: "ACCOUNT_SETUP",
        codeHash,
        expiresAt,
      },
    });

    return createdUser;
  });

  await sendOtpEmail({
    to: email,
    fullName,
    otp,
  });

  console.log("OTP generado:", otp);

  return user;
}

module.exports = {
  createUserByAdmin,
};