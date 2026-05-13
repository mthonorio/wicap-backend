import { FastifyRequest, FastifyReply } from "fastify";
import { adminService } from "../services/admin.service";

export const adminController = {
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await adminService.getStats();
      return reply.code(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar estatísticas",
      });
    }
  },

  async getManagers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const managers = await adminService.getManagersList();
      return reply.code(200).send({
        success: true,
        data: managers,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar organizadores",
      });
    }
  },

  async getResidents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const residentsReport = await adminService.getResidents();
      return reply.code(200).send({
        success: true,
        data: residentsReport,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar moradores",
      });
    }
  },

  async getEncargos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const encargos = await adminService.getEncargos();
      return reply.code(200).send({
        success: true,
        data: encargos,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar encargos",
      });
    }
  },

  async getCondominiums(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { managerId } = request.query as any;
      const condominiums =
        (await adminService.getCondominiums?.(managerId)) || [];
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

  async getReports(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.code(200).send({
        success: true,
        data: [],
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar relatórios",
      });
    }
  },
};
