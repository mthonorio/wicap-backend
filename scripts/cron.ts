import "dotenv/config";
import cron from "node-cron";
import {
  updateOverdueInvoices,
  waitForDb,
} from "../src/lib/billing/update-overdue";

console.log("🟢 Cron iniciado...");

let running = false;

async function start() {
  await waitForDb();

  cron.schedule("0 0 * * *", async () => {
    if (running) return;
    running = true;

    try {
      console.log("⏰ Rodando atualização...");
      await updateOverdueInvoices();
      console.log("✅ Finalizado");
    } catch (err) {
      console.error("❌ Erro:", err);
    } finally {
      running = false;
    }
  });
}

start();
