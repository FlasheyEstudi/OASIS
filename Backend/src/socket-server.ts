import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  },
  path: "/api/socket"
});

console.log("🌿 Oasis Real-time Server initializing...");

io.on("connection", (socket) => {
  console.log(`📡 New connection: ${socket.id}`);

  // Room management for orders
  socket.on("join-order", (orderId: string) => {
    socket.join(`order:${orderId}`);
    console.log(`📦 Socket ${socket.id} joined tracking for order: ${orderId}`);
  });

  // Handle location updates from drivers
  socket.on("delivery:locationUpdate", async (data: { orderId: string, latitude: number, longitude: number }) => {
    const { orderId, latitude, longitude } = data;
    
    console.log(`📍 Location update for order ${orderId}: ${latitude}, ${longitude}`);

    // 1. Broadcast to everyone in the room (the patient)
    io.to(`order:${orderId}`).emit("delivery:trackingUpdate", {
      orderId,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });

    // 2. Persist in database for robustness
    try {
      await prisma.delivery.update({
        where: { orderId },
        data: {
          currentLat: latitude,
          currentLng: longitude
        }
      });
    } catch (err) {
      console.error(`❌ Failed to persist location for order ${orderId}:`, err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Disconnected: ${socket.id}`);
  });
});

const PORT = 3002; // Run on a separate port or integrate with custom server
httpServer.listen(PORT, () => {
  console.log(`🚀 Oasis Real-time Server running on http://localhost:${PORT}`);
  console.log(`🔗 Tracking path: /api/socket`);
});
