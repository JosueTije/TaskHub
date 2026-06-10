require("dotenv").config(); // must be first — loads .env before any other module reads process.env

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const sprintRoutes = require("./routes/sprint.routes");
const ticketRoutes = require("./routes/ticket.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const gamificationRoutes = require("./routes/gamification.routes");
const notificationRoutes = require("./routes/notification.routes");
const aiRoutes = require("./routes/ai.routes");
const activityRoutes = require("./routes/activity.routes");
const githubWebhookController = require("./controllers/github.webhook");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); //protecciónn !!
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // allow exact matches
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // allow any vercel preview deploy for this project
      if (/^https:\/\/taskhub-[a-z0-9]+-julietalozano13s-projects\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── Webhook de GitHub ──────────────────────────────────────────────────────
// DEBE ir ANTES de express.json() porque la verificación de firma necesita
// el body como Buffer crudo, no como JSON parseado.
app.use(
  "/webhooks/github",
  express.raw({ type: "application/json" }),
  githubWebhookController
);

app.use(express.json()); // recibir
app.use(cookieParser()); //leer cookiees
app.use(morgan("dev")); //request de consolaaa

app.get("/", (req, res) => {
  res.json({ message: "Backend TaskHub funcionando!! wuuu :)" });
});

// rutasssss!!

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/sprints", sprintRoutes);
app.use("/tickets", ticketRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/gamification", gamificationRoutes);
app.use("/notifications", notificationRoutes);
app.use("/ai", aiRoutes);
app.use("/", activityRoutes);

module.exports = app;