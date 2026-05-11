import { FastifyRequest, FastifyReply } from "fastify";
import { invoiceService } from "../services/invoice.service";
import { updateInvoiceSchema } from "../schemas/invoice.schema";
import { AppError } from "../utils/errors";

export const invoiceController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      if (!user) {
        return reply.code(401).send({
          success: false,
          error: "Não autenticado",
        });
      }

      const { status, condominiumId, managerId, take, cursor } =
        request.query as any;

      const result = await invoiceService.getAll({
        status,
        condominiumId,
        managerId,
        role: user.role,
        userId: user.userId,
        take: take ? parseInt(take) : 50,
        cursor,
      });

      return reply.code(200).send({
        success: true,
        data: result.data,
        nextCursor: result.nextCursor,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar faturas",
      });
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      return reply.code(200).send({
        success: true,
        data: { id },
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar fatura",
      });
    }
  },

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const data = updateInvoiceSchema.parse(request.body);

      await invoiceService.updateStatus(id, data.status);

      return reply.code(200).send({
        success: true,
        message: "Fatura atualizada com sucesso",
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
        error: "Erro ao atualizar fatura",
      });
    }
  },

  async importInvoices(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.code(200).send({
        success: true,
        message: "Faturas importadas com sucesso",
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao importar faturas",
      });
    }
  },
};
