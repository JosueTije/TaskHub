const express = require("express");
const { getUsersController, addProjectMember, getDevelopers} = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", requireAuth, getUsersController);
router.get("/developers", requireAuth, getDevelopers);
router.post("/:projectId/members", requireAuth, addProjectMember);
module.exports = router;