"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForDb = waitForDb;
exports.updateOverdueInvoices = updateOverdueInvoices;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function waitForDb(maxRetries = 30) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await prisma.$queryRaw `SELECT 1`;
            console.log("✅ Conectado ao banco de dados");
            return;
        }
        catch (error) {
            retries++;
            console.log(`⏳ Tentando conectar ao banco... (${retries}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    throw new Error("Falha ao conectar ao banco de dados após 30 tentativas");
}
async function updateOverdueInvoices() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Atualizar faturas vencidas que ainda não foram marcadas como OVERDUE
        const updated = await prisma.invoice.updateMany({
            where: {
                status: "PENDING",
                dueDate: {
                    lt: today,
                },
            },
            data: {
                status: "OVERDUE",
            },
        });
        console.log(`📊 ${updated.count} faturas marcadas como vencidas`);
        return updated.count;
    }
    catch (error) {
        console.error("❌ Erro ao atualizar faturas vencidas:", error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
//# sourceMappingURL=update-overdue.js.map