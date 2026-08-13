import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";

import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";
import { registerSocketHandlers } from "./sockets/index.js";

async function main() {
  const app = createApp();
  const httpServer = createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  registerSocketHandlers(io);
  app.set("io", io);

  httpServer.listen(env.port, () => {
    console.log(`✒️  Ink & Ivory server running on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    httpServer.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
