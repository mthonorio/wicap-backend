import { FastifyRequest, FastifyReply } from "fastify";
import { residentService } from "../services/resident.service";

export const residentController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { apartmentId, take, cursor } = request.query as any;
      const residents = await residentService.getAll(apartmentId, take, cursor);

      return reply.code(200).send({
        success: true,
        data: residents,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar moradores",
      });
    }
  },
};
