import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Server
  NODE_ENV: (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test",
  PORT: parseInt(process.env.PORT || "3000"),
  HOST: process.env.HOST || "0.0.0.0",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "secret-key-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Files
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
};

// Validações
if (!env.DATABASE_URL && env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL not defined");
}

if (!env.JWT_SECRET && env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET not defined");
}
