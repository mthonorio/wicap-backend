import { userRepository } from "../repositories/user.repository";
import { managerRepository } from "../repositories/manager.repository";
import { passwordUtil } from "../utils/password.util";
import { jwtUtil } from "../utils/jwt.util";
import { UnauthorizedError, ConflictError } from "../utils/errors";
import { AuthUser } from "../types";
import { prisma } from "../config/database";
import { CreateManagerRequest } from "../schemas/auth.schema";

export const authService = {
  async login(
    email: string,
    password: string,
  ): Promise<{ user: AuthUser; token: string }> {
    const user = await userRepository.findByEmail(email);

    if (!user || !(await passwordUtil.compare(password, user.password))) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    let managerId: string | undefined;
    let residentId: string | undefined;

    if (user.role === "MANAGER") {
      const manager = await managerRepository.findByUserId(user.id);
      managerId = manager?.id;
    }

    if (user.role === "RESIDENT") {
      const resident = await prisma.resident.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      residentId = resident?.id;
    }

    const authUser: AuthUser = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      managerId,
      residentId,
    };

    const token = jwtUtil.generateToken(authUser);

    return { user: authUser, token };
  },

  async createManager(data: CreateManagerRequest): Promise<AuthUser> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("Email já cadastrado");
    }

    const hashedPassword = await passwordUtil.hash(data.password);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "MANAGER",
        manager: { create: {} },
      },
      include: {
        manager: true,
      },
    });

    const authUser: AuthUser = {
      id: newUser.id,
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      managerId: newUser.manager?.id,
    };

    return authUser;
  },
};
