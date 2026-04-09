const express = require("express");
const { createUser } = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/users", requireAuth, requireRole("ADMIN"), createUser);

module.exports = router;