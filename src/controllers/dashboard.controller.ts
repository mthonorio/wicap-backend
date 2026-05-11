import { FastifyRequest, FastifyReply } from "fastify";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async getManagerDashboard(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      if (!user) {
        return reply.code(401).send({
          success: false,
          error: "Não autenticado",
        });
      }

      const dashboard = await dashboardService.getManagerDashboard(user.userId);

      if (!dashboard) {
        return reply.code(404).send({
          success: false,
          error: "Dashboard não encontrado",
        });
      }

      return reply.code(200).send({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar dashboard",
      });
    }
  },

  async getResidentDashboard(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = request.user as any;
      if (!user) {
        return reply.code(401).send({
          success: false,
          error: "Não autenticado",
        });
      }

      const dashboard = await dashboardService.getResidentDashboard(
        user.userId,
      );

      if (!dashboard) {
        return reply.code(404).send({
          success: false,
          error: "Dashboard não encontrado",
        });
      }

      return reply.code(200).send({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: "Erro ao buscar dashboard",
      });
    }
  },
};
