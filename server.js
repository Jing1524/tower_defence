const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();

app.use(express.static(`${__dirname}/public`));

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.emit("message", "you are connected");
});

server.on("error", (err) => {
  console.error(err);
});

server.listen(8080, () => {
  console.log("server is listening on port 8080");
});
