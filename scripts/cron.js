"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_cron_1 = __importDefault(require("node-cron"));
const update_overdue_1 = require("../src/lib/billing/update-overdue");
console.log("🟢 Cron iniciado...");
let running = false;
async function start() {
    await (0, update_overdue_1.waitForDb)();
    node_cron_1.default.schedule("0 0 * * *", async () => {
        if (running)
            return;
        running = true;
        try {
            console.log("⏰ Rodando atualização...");
            await (0, update_overdue_1.updateOverdueInvoices)();
            console.log("✅ Finalizado");
        }
        catch (err) {
            console.error("❌ Erro:", err);
        }
        finally {
            running = false;
        }
    });
}
start();
//# sourceMappingURL=cron.js.map