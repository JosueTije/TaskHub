const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { getProjectActivityController } = require("../controllers/activity.controller");

const router = express.Router();

router.get("/projects/:projectId/activity", requireAuth, getProjectActivityController);

module.exports = router;
