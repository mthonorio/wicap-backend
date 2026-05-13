import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";

export const condominiumRepository = {
  async findMany(managerId?: string) {
    return prisma.$queryRaw<
      {
        id: string;
        name: string;
        address: string;
        cnpj: string | null;
        city: string | null;
        state: string | null;
        created_at: Date;
        totalResidents: number;
        totalDebt: number;
      }[]
    >(Prisma.sql`
      SELECT 
        c.id,
        c.name,
        c.address,
        c.cnpj,
        c.city,
        c.state,
        c.created_at,
        COUNT(DISTINCT r.id)::int AS "totalResidents",
        COALESCE(SUM(
          CASE 
            WHEN i.status IN ('PENDING', 'OVERDUE') 
            THEN i.amount_total 
            ELSE 0 
          END
        ), 0)::float AS "totalDebt"
      FROM condominiums c
      LEFT JOIN apartments a ON a.condominium_id = c.id
      LEFT JOIN residents r ON r.apartment_id = a.id
      LEFT JOIN invoices i ON i.resident_id = r.id
      ${managerId ? Prisma.sql`WHERE c.manager_id = ${managerId}` : Prisma.empty}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
  },

  async create(data: {
    name: string;
    address: string;
    managerId: string;
    cnpj?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) {
    return prisma.condominium.create({
      data,
    });
  },

  async findById(id: string) {
    return prisma.condominium.findUnique({
      where: { id },
    });
  },
};
