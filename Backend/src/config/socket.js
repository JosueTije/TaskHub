const { Server } = require("socket.io");

let io = null;

function init(httpServer) {
  const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/^https:\/\/taskhub-[a-z0-9]+-julietalozano13s-projects\.vercel\.app$/.test(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join:project", (projectId) => {
      if (projectId) socket.join(`project:${projectId}`);
    });
    socket.on("leave:project", (projectId) => {
      if (projectId) socket.leave(`project:${projectId}`);
    });
    socket.on("join:user", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });

  return io;
}

function getIO() {
  return io; // returns null if not initialized — callers handle gracefully
}

module.exports = { init, getIO };
