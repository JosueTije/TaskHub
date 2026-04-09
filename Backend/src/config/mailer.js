const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail({ to, fullName, otp }) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "TaskHub - Código OTP de acceso",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenido a TaskHub</h2>
        <p>Hola ${fullName},</p>
        <p>Tu cuenta ha sido creadaaa! Bienvenidooooo!! mucho éxito!!</p>
        <p>Debes iniciar sesión con tu correo y la contraseña temporal que te dio el administrador, y posteriormente cambiarla!!.</p>
        <p>Después, ingresa este código OTP:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
          ${otp}
        </div>
        <p>Este código vence en 15 minutos.</p>
      </div>
    `,
  });
}

module.exports = {
  sendOtpEmail,
};