import { FastifyRequest, FastifyReply } from "fastify";
import { jwtUtil } from "../utils/jwt.util";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { prisma } from "../config/database";
import { Role } from "@prisma/client";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const token = request.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Token não fornecido");
    }

    const decoded = jwtUtil.verifyToken(token);

    // Fetch full user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError("Usuário não encontrado");
    }

    (request as any).user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      managerId: decoded.managerId,
      residentId: decoded.residentId,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.code(401).send({
        success: false,
        error: error.message,
      });
    }
    return reply.code(401).send({
      success: false,
      error: "Não autenticado",
    });
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user) {
      return reply.code(401).send({
        success: false,
        error: "Não autenticado",
      });
    }

    if (!roles.includes(user.role)) {
      return reply.code(403).send({
        success: false,
        error: "Acesso negado",
      });
    }
  };
}
