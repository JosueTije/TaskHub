const express = require("express");
const { getUsersController } = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getUsersController);
router.get("/developers", authMiddleware, getDevelopers);
router.post("/:projectId/members", authMiddleware, addProjectMember);
module.exports = router;