import { FastifyRequest, FastifyReply } from "fastify";
import { condominiumService } from "../services/condominium.service";
import { createCondominiumSchema } from "../schemas/condominium.schema";
import { AppError } from "../utils/errors";

export const condominiumController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { managerId } = request.query as any;
      const condominiums = await condominiumService.getAll(managerId);

      return reply.code(200).send({
        success: true,
        data: condominiums,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar condomínios",
      });
    }
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      if (!user || !user.managerId) {
        return reply.code(403).send({
          success: false,
          error: "Acesso negado",
        });
      }

      const data = createCondominiumSchema.parse(request.body);
      const condominium = await condominiumService.create({
        ...data,
        managerId: user.managerId,
      });

      return reply.code(201).send({
        success: true,
        data: condominium,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          success: false,
          error: error.message,
        });
      }
      return reply.code(500).send({
        success: false,
        error: "Erro ao criar condomínio",
      });
    }
  },
};
