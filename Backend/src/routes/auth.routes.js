const express = require("express");
const router = express.Router();
const {
  loginController,
  verifyOtpController,
  setNewPasswordController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  resendOtpController,
} = require("../controllers/auth.controller");

router.post("/login", loginController);
router.post("/verify-otp", verifyOtpController);
router.post("/resend-otp", resendOtpController);
router.post("/set-password", setNewPasswordController);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

module.exports = router;