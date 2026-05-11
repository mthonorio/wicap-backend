import "fastify";
import { AuthUser } from "./index";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;
      HOST: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      CORS_ORIGIN: string;
      MAX_FILE_SIZE: string;
    }
  }
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}
