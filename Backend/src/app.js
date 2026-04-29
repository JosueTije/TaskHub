const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const sprintRoutes = require("./routes/sprint.routes");

dotenv.config();

const app = express();

app.use(helmet()); //protecciónn !!
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://taskhub-frontend-phi.vercel.app",
    ],
    credentials: true,
  })
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

module.exports = app;