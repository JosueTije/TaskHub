const emailjs = require("@emailjs/nodejs");

async function sendOtpEmail({ to, fullName, otp }) {
  const templateParams = {
    email: to,
    to_email: to,
    fullName,
    otp,
    appName: "TaskHub",
  };

  const result = await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_TEMPLATE_ID,
    templateParams,
    {
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    }
  );

  console.log("EmailJS result:", result);
  return result;
}

async function sendPasswordResetEmail({ to, fullName, resetLink }) {
  const templateParams = {
    email: to,
    to_email: to,
    fullName,
    reset_link: resetLink,
    appName: "TaskHub",
  };

  const result = await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_RESET_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID,
    templateParams,
    {
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    }
  );

  console.log("EmailJS reset result:", result);
  return result;
}

module.exports = { sendOtpEmail, sendPasswordResetEmail };