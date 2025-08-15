import { Server } from "socket.io";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL || "http://localhost:5173"],
      credentials: true,
    },
  });

  // Map to store online users
  const userSocketMap = {}; // { userId: socketId }

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      if (userId) delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  // Helper function for controllers
  io.getReceiverSocketId = (userId) => userSocketMap[userId];

  return io;
}
