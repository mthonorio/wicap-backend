import { prisma } from "../config/database";

export const residentRepository = {
  async findMany(apartmentId?: string, take = 50, cursor?: string) {
    return prisma.resident.findMany({
      where: apartmentId ? { apartmentId } : undefined,
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { id: "asc" },
      select: {
        id: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        apartment: {
          select: { number: true },
        },
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.resident.findUnique({
      where: { userId },
    });
  },

  async findById(id: string) {
    return prisma.resident.findUnique({
      where: { id },
    });
  },

  async create(data: { userId: string; apartmentId: string }) {
    return prisma.resident.create({
      data,
    });
  },
};
