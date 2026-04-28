const express = require("express");
const { getUsersController } = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getUsersController);

module.exports = router;