const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { chatController } = require("../controllers/ai.controller");

const router = express.Router();

router.post("/chat", requireAuth, requireRole("ADMIN", "PM"), chatController);

module.exports = router;
