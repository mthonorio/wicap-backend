import { prisma } from "../config/database";

export const managerRepository = {
  async findAll() {
    return prisma.manager.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
        _count: { select: { condominiums: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByUserId(userId: string) {
    return prisma.manager.findUnique({
      where: { userId },
    });
  },

  async create(userId: string) {
    return prisma.manager.create({
      data: { userId },
    });
  },

  async findById(id: string) {
    return prisma.manager.findUnique({
      where: { id },
    });
  },
};
