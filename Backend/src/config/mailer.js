const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail({ to, fullName, otp }) {
  await resend.emails.send({
    from: process.env.MAIL_FROM || "TaskHub <onboarding@resend.dev>",
    to,
    subject: "Código de verificación TaskHub",
    html: `
      <h2>Hola ${fullName}</h2>
      <p>Tu código de verificación es:</p>
      <h1>${otp}</h1>
      <p>Este código vence en 10 minutos.</p>
    `,
  });
}

module.exports = { sendOtpEmail };