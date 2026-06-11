const { login, setNewPassword } = require("../services/auth.service");

// ── Mock all external dependencies ────────────────────────────────────────────
jest.mock("../config/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userOtp: {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb({
    user: { update: jest.fn() },
    userOtp: { updateMany: jest.fn() },
  })),
}));

jest.mock("../utils/password", () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
  validatePasswordStrength: jest.fn(),
}));

jest.mock("../utils/jwt", () => ({
  signAccessToken: jest.fn(() => "mock_access_token"),
  signOtpSessionToken: jest.fn(() => "mock_otp_token"),
  signPasswordResetToken: jest.fn(() => "mock_reset_token"),
  verifyToken: jest.fn(),
}));

jest.mock("../config/mailer", () => ({
  sendOtpEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("../utils/otp", () => ({
  compareOtp: jest.fn(),
  generateOtp: jest.fn(() => "123456"),
  hashOtp: jest.fn(() => "hashed_otp"),
  getOtpExpiration: jest.fn(() => new Date(Date.now() + 600000)),
}));

const prisma = require("../config/prisma");
const { comparePassword, validatePasswordStrength, hashPassword } = require("../utils/password");
const { signAccessToken, signOtpSessionToken, verifyToken } = require("../utils/jwt");

// ── login ──────────────────────────────────────────────────────────────────────
describe("login", () => {
  beforeEach(() => jest.clearAllMocks());

  const activeUser = {
    id: "user-1",
    email: "admin@taskhub.com",
    fullName: "Admin",
    role: "ADMIN",
    passwordHash: "hashed",
    status: "ACTIVE",
    mustChangePassword: false,
  };

  test("retorna accessToken cuando las credenciales son válidas", async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser);
    comparePassword.mockResolvedValue(true);

    const result = await login({ email: "admin@taskhub.com", password: "Admin123!" });

    expect(result.requiresOtp).toBe(false);
    expect(result.accessToken).toBe("mock_access_token");
    expect(result.user.email).toBe("admin@taskhub.com");
    expect(signAccessToken).toHaveBeenCalledWith({
      sub: "user-1",
      email: "admin@taskhub.com",
      role: "ADMIN",
    });
  });

  test("lanza error con credenciales inválidas — usuario no existe", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(login({ email: "x@x.com", password: "pass" }))
      .rejects.toThrow("Credenciales inválidas");
  });

  test("lanza error con credenciales inválidas — contraseña incorrecta", async () => {
    prisma.user.findUnique.mockResolvedValue(activeUser);
    comparePassword.mockResolvedValue(false);

    await expect(login({ email: "admin@taskhub.com", password: "wrong" }))
      .rejects.toThrow("Credenciales inválidas");
  });

  test("lanza error si el usuario está inactivo", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...activeUser, status: "INACTIVE" });
    comparePassword.mockResolvedValue(true);

    await expect(login({ email: "admin@taskhub.com", password: "Admin123!" }))
      .rejects.toThrow("Usuario inactivo");
  });

  test("devuelve requiresOtp:true en primer acceso (mustChangePassword)", async () => {
    prisma.user.findUnique.mockResolvedValue({ ...activeUser, mustChangePassword: true });
    comparePassword.mockResolvedValue(true);

    const result = await login({ email: "admin@taskhub.com", password: "Admin123!" });

    expect(result.requiresOtp).toBe(true);
    expect(result.otpToken).toBe("mock_otp_token");
    expect(signOtpSessionToken).toHaveBeenCalled();
  });
});

// ── setNewPassword ─────────────────────────────────────────────────────────────
describe("setNewPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  test("lanza error si el token no es del propósito correcto", async () => {
    verifyToken.mockReturnValue({ purpose: "OTHER", sub: "user-1" });

    await expect(setNewPassword({ setupPasswordToken: "bad_token", newPassword: "NewPass1!" }))
      .rejects.toThrow("Token inválido");
  });

  test("lanza error si la contraseña no cumple requisitos", async () => {
    verifyToken.mockReturnValue({ purpose: "SET_NEW_PASSWORD", sub: "user-1" });
    validatePasswordStrength.mockReturnValue(false);

    await expect(setNewPassword({ setupPasswordToken: "token", newPassword: "weak" }))
      .rejects.toThrow("La contraseña debe tener");
  });

  test("actualiza la contraseña correctamente", async () => {
    verifyToken.mockReturnValue({ purpose: "SET_NEW_PASSWORD", sub: "user-1" });
    validatePasswordStrength.mockReturnValue(true);
    hashPassword.mockResolvedValue("new_hashed");
    prisma.user.findUnique.mockResolvedValue({ id: "user-1" });

    const result = await setNewPassword({ setupPasswordToken: "token", newPassword: "NewPass1!" });

    expect(result.message).toBe("Contraseña actualizada correctamente");
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
