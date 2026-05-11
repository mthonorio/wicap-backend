import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./config/environment";
import { setupRoutes } from "./routes";

export async function createApp() {
  const app = Fastify({
    logger: env.NODE_ENV === "development",
  });

  // Register plugins
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    console.error("[ERROR]", error);

    return reply.code(500).send({
      success: false,
      error: "Erro interno do servidor",
    });
  });

  // Setup routes
  await setupRoutes(app);

  return app;
}
