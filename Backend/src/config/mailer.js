const emailjs = require("@emailjs/nodejs");

async function sendOtpEmail({ to, fullName, otp }) {
  if (
    !process.env.EMAILJS_SERVICE_ID ||
    !process.env.EMAILJS_TEMPLATE_ID ||
    !process.env.EMAILJS_PUBLIC_KEY
  ) {
    console.log("EmailJS no configurado. OTP:", otp);
    return;
  }

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
    }
  );

  console.log("EmailJS result:", result);
  return result;
}

module.exports = { sendOtpEmail };