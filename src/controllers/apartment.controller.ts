import { FastifyRequest, FastifyReply } from "fastify";
import { apartmentService } from "../services/apartment.service";
import { createApartmentSchema } from "../schemas/condominium.schema";
import { AppError } from "../utils/errors";

export const apartmentController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { condominiumId, take, cursor } = request.query as any;
      const apartments = await apartmentService.getAll(
        condominiumId,
        take,
        cursor,
      );

      return reply.code(200).send({
        success: true,
        data: apartments,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar apartamentos",
      });
    }
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = createApartmentSchema.parse(request.body);
      const apartment = await apartmentService.create(data);

      return reply.code(201).send({
        success: true,
        data: apartment,
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
        error: "Erro ao criar apartamento",
      });
    }
  },
};
