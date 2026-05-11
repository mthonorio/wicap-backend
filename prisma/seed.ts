/// <reference types="node" />
import "dotenv/config";
import { PrismaClient, Role, InvoiceStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

function randomDecimal(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  try {
    // 🧹 Limpar banco (ordem correta por FK)
    console.log("🧹 Limpando dados existentes...");
    await prisma.billingFeeReport.deleteMany();
    await prisma.billingAgreement.deleteMany();
    await prisma.billingHistory.deleteMany();
    await prisma.billingCaseInvoice.deleteMany();
    await prisma.billingCase.deleteMany();
    await prisma.invoiceDocument.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.resident.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.billingSettings.deleteMany();
    await prisma.condominium.deleteMany();
    await prisma.manager.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("senha123", 10);

    // 👑 Criar SUPER ADMIN
    console.log("👑 Criando Super Admin...");
    const admin = await prisma.user.create({
      data: {
        name: "Administrador Geral",
        email: "admin@wicap.com",
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
    });
    console.log(`✅ Admin criado: ${admin.email}`);

    // 👨‍💼 Criar MANAGERS
    console.log("👨‍💼 Criando Gerenciadores...");
    const manager1User = await prisma.user.create({
      data: {
        name: "João Silva",
        email: "joao@wicap.com",
        document: "12345678901",
        phone: "(11) 98765-4321",
        password: hashedPassword,
        role: Role.MANAGER,
        manager: {
          create: {},
        },
      },
      include: {
        manager: true,
      },
    });

    const manager2User = await prisma.user.create({
      data: {
        name: "Maria Santos",
        email: "maria@wicap.com",
        document: "98765432101",
        phone: "(11) 99876-5432",
        password: hashedPassword,
        role: Role.MANAGER,
        manager: {
          create: {},
        },
      },
      include: {
        manager: true,
      },
    });

    console.log(
      `✅ Managers criados: ${manager1User.email}, ${manager2User.email}`,
    );

    // 🏢 Criar CONDOMINIUMS
    console.log("🏢 Criando Condomínios...");
    const condo1 = await prisma.condominium.create({
      data: {
        name: "Edifício Solaris",
        address: "Rua das Flores, 123",
        cnpj: "12345678000100",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        managerId: manager1User.manager!.id,
        apartments: {
          create: [
            {
              block: "A",
              number: "101",
              areaM2: new Prisma.Decimal("65.5"),
              fractionPct: new Prisma.Decimal("0.12"),
            },
            {
              block: "A",
              number: "102",
              areaM2: new Prisma.Decimal("70.0"),
              fractionPct: new Prisma.Decimal("0.13"),
            },
            {
              block: "B",
              number: "201",
              areaM2: new Prisma.Decimal("80.0"),
              fractionPct: new Prisma.Decimal("0.15"),
            },
            {
              block: "B",
              number: "202",
              areaM2: new Prisma.Decimal("82.0"),
              fractionPct: new Prisma.Decimal("0.15"),
            },
          ],
        },
      },
      include: {
        apartments: true,
      },
    });

    const condo2 = await prisma.condominium.create({
      data: {
        name: "Residencial Aurora",
        address: "Av. Paulista, 1000",
        cnpj: "98765432000100",
        city: "São Paulo",
        state: "SP",
        zipCode: "01311-100",
        managerId: manager2User.manager!.id,
        apartments: {
          create: [
            {
              block: "A",
              number: "01",
              areaM2: new Prisma.Decimal("55.0"),
              fractionPct: new Prisma.Decimal("0.1"),
            },
            {
              block: "A",
              number: "02",
              areaM2: new Prisma.Decimal("60.0"),
              fractionPct: new Prisma.Decimal("0.11"),
            },
            {
              block: "B",
              number: "01",
              areaM2: new Prisma.Decimal("75.0"),
              fractionPct: new Prisma.Decimal("0.14"),
            },
          ],
        },
      },
      include: {
        apartments: true,
      },
    });

    console.log(`✅ Condomínios criados: ${condo1.name}, ${condo2.name}`);

    // 👥 Criar RESIDENTS
    console.log("👥 Criando Moradores...");
    const residentsData = [
      {
        name: "Carlos Oliveira",
        email: "carlos@residents.com",
        document: "11111111111",
        phone: "(11) 91111-1111",
        apt: condo1.apartments[0],
      },
      {
        name: "Ana Paula Costa",
        email: "ana@residents.com",
        document: "22222222222",
        phone: "(11) 92222-2222",
        apt: condo1.apartments[1],
      },
      {
        name: "Pedro Souza",
        email: "pedro@residents.com",
        document: "33333333333",
        phone: "(11) 93333-3333",
        apt: condo1.apartments[2],
      },
      {
        name: "Fernanda Lima",
        email: "fernanda@residents.com",
        document: "44444444444",
        phone: "(11) 94444-4444",
        apt: condo2.apartments[0],
      },
      {
        name: "Roberto Silva",
        email: "roberto@residents.com",
        document: "55555555555",
        phone: "(11) 95555-5555",
        apt: condo2.apartments[1],
      },
    ];

    const residents = [];
    for (const residentData of residentsData) {
      const user = await prisma.user.create({
        data: {
          name: residentData.name,
          email: residentData.email,
          document: residentData.document,
          phone: residentData.phone,
          password: hashedPassword,
          role: Role.RESIDENT,
          resident: {
            create: {
              apartmentId: residentData.apt.id,
            },
          },
        },
        include: {
          resident: true,
        },
      });
      residents.push(user.resident);
    }

    console.log(`✅ ${residents.length} moradores criados`);

    // 💸 Criar INVOICES
    console.log("💸 Criando Faturas...");
    const allResidents = await prisma.resident.findMany({
      include: {
        apartment: {
          include: {
            condominium: true,
          },
        },
      },
    });
    const now = new Date();
    let invoiceCount = 0;

    for (const resident of allResidents) {
      const managerId = resident.apartment.condominium.managerId;
      const condominiumId = resident.apartment.condominiumId;

      for (let i = 0; i < 5; i++) {
        const dueDate = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          10,
          0,
          0,
          0,
        );

        const isPaid = i > 2;

        const amountOriginal = randomDecimal(400, 700);
        const amountMulta = isPaid ? 0 : randomDecimal(10, 50);
        const amountJuros = isPaid ? 0 : randomDecimal(5, 25);
        const amountCorrecao = 0;
        const amountTotal = amountOriginal + amountMulta + amountJuros;

        await prisma.invoice.create({
          data: {
            residentId: resident.id,
            managerId,
            condominiumId,
            number: `INV-${condominiumId.slice(0, 8)}-${resident.id.slice(0, 8)}-${i}`,
            type: "CONDOMINIO",
            competence: `${String(dueDate.getMonth() + 1).padStart(2, "0")}/${dueDate.getFullYear()}`,
            amountOriginal: new Prisma.Decimal(amountOriginal),
            amountJuros: new Prisma.Decimal(amountJuros),
            amountMulta: new Prisma.Decimal(amountMulta),
            amountCorrecao: new Prisma.Decimal(amountCorrecao),
            amountTotal: new Prisma.Decimal(amountTotal),
            dueDate,
            issuedAt: dueDate,
            paidAt: isPaid
              ? new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000)
              : null,
            status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.OVERDUE,
            description: `Taxa de condomínio referente a ${String(dueDate.getMonth() + 1).padStart(2, "0")}/${dueDate.getFullYear()}`,
            daysLate: isPaid
              ? 0
              : Math.floor(
                  (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
                ),
          },
        });
        invoiceCount++;
      }
    }

    console.log(`✅ ${invoiceCount} faturas criadas`);

    console.log("\n✨ ✨ ✨ Seed finalizado com sucesso! ✨ ✨ ✨\n");
    console.log("📧 Credenciais de teste:");
    console.log(`  Admin: admin@wicap.com / senha123`);
    console.log(`  Manager 1: joao@wicap.com / senha123`);
    console.log(`  Manager 2: maria@wicap.com / senha123`);
    console.log(`  Resident: carlos@residents.com / senha123\n`);
  } catch (error) {
    console.error("❌ Erro durante seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
