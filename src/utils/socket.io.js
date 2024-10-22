import { Server } from "socket.io";
let io = null; // Initially null, will be assigned during initialization

// Function to initialize Socket.IO
export const initSocket = (httpServer) => {
  if (io) {
    console.log("⚠️ Socket.IO is already initialized!");
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust the origin as needed
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("✅ Socket.IO initialized!");

  // Socket connection logic
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // Custom event listeners
    socket.on("message", (data) => {
      console.log("Received message:", data);
      io.emit("message", data);
    });
  });

  return io;
};

// Directly export the io instance (which will be null initially)
export default () => {
  if (!io) {
    throw new Error("❌ Socket.IO has not been initialized. Call initSocket first.");
  }
  return io;
};
