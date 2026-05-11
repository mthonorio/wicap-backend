import { prisma } from "../config/database";
import { User } from "@prisma/client";

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
    role: "SUPER_ADMIN" | "MANAGER" | "RESIDENT";
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  },
};
