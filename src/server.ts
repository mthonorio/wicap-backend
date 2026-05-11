import { createApp } from "./app";
import { env } from "./config/environment";

async function main() {
  try {
    const app = await createApp();

    await app.listen({ port: env.PORT, host: env.HOST });

    console.log(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

main();
