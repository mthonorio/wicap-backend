import { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "../services/auth.service";
import { loginSchema, createManagerSchema } from "../schemas/auth.schema";
import { AppError, UnauthorizedError } from "../utils/errors";

export const authController = {
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = loginSchema.parse(request.body);
      const { user, token } = await authService.login(
        data.email,
        data.password,
      );

      return reply.code(200).send({
        success: true,
        data: { user, token },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: error.message,
        });
      }
      throw error;
    }
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: "Não autenticado",
      });
    }

    return reply.code(200).send({
      success: true,
      data: request.user,
    });
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    return reply.code(200).send({
      success: true,
      message: "Logout realizado com sucesso",
    });
  },
};

export const adminAuthController = {
  async createManager(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createManagerSchema.parse(request.body);
      const user = await authService.createManager(data);

      return reply.code(201).send({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: error.message,
        });
      }
      throw error;
    }
  },
};
