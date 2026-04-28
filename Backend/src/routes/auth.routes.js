const express = require("express");
const router = express.Router();
const {
  loginController,
  verifyOtpController,
  setNewPasswordController,
  logoutController,
} = require("../controllers/auth.controller");

router.post("/login", loginController);
router.post("/verify-otp", verifyOtpController);
router.post("/set-password", setNewPasswordController);
router.post("/logout", logoutController);

module.exports = router;