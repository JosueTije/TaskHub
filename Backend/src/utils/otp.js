const crypto = require("crypto");
const bcrypt = require("bcryptjs");

function generateOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function compareOtp(plainOtp, hashedOtp) {
  return bcrypt.compare(plainOtp, hashedOtp);
}

function getOtpExpiration(minutes = 10) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
  return expiresAt;
}

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  getOtpExpiration,
};