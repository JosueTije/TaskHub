const http = require("http");
const app = require("./app");
const { init: initSocket } = require("./config/socket");

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
