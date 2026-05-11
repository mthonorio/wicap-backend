import { prisma } from "../config/database";

export const apartmentRepository = {
  async findMany(condominiumId?: string, take = 50, cursor?: string) {
    return prisma.apartment.findMany({
      where: condominiumId ? { condominiumId } : undefined,
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { id: "asc" },
      select: {
        id: true,
        block: true,
        number: true,
        areaM2: true,
        fractionPct: true,
        condominium: {
          select: { id: true, name: true },
        },
      },
    });
  },

  async create(data: {
    number: string;
    block?: string;
    areaM2?: number;
    fractionPct?: number;
    condominiumId: string;
  }) {
    return prisma.apartment.create({
      data,
    });
  },

  async findById(id: string) {
    return prisma.apartment.findUnique({
      where: { id },
    });
  },
};
