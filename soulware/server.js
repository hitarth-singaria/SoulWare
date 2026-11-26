const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (bookingId) => {
      socket.join(bookingId);
    });

    socket.on("send-message", ({ bookingId, message }) => {
      socket.to(bookingId).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`Server running on port ${port}`);
  });
});
