import { FastifyInstance } from "fastify";
import {
  authController,
  adminAuthController,
} from "../controllers/auth.controller";
import { adminController } from "../controllers/admin.controller";
import { condominiumController } from "../controllers/condominium.controller";
import { apartmentController } from "../controllers/apartment.controller";
import { residentController } from "../controllers/resident.controller";
import { invoiceController } from "../controllers/invoice.controller";
import { dashboardController } from "../controllers/dashboard.controller";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { Role } from "@prisma/client";

export async function setupRoutes(app: FastifyInstance) {
  // ========================================
  // AUTH ROUTES (PUBLIC)
  // ========================================
  app.post("/v1/auth/login", authController.login);
  app.post("/v1/auth/logout", authController.logout);
  app.get("/v1/auth/me", { onRequest: authMiddleware }, authController.me);

  // ========================================
  // ADMIN ROUTES (SUPER_ADMIN ONLY)
  // ========================================
  app.get(
    "/v1/admin/stats",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getStats,
  );
  app.get(
    "/v1/admin/managers",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getManagers,
  );
  app.post(
    "/v1/admin/managers",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminAuthController.createManager,
  );
  app.get(
    "/v1/admin/residents",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getResidents,
  );
  app.get(
    "/v1/admin/condominiums",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getCondominiums,
  );
  app.get(
    "/v1/admin/encargos",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getEncargos,
  );
  app.get(
    "/v1/admin/reports",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getReports,
  );

  // ========================================
  // CONDOMINIUM ROUTES (MANAGER + SUPER_ADMIN)
  // ========================================
  app.get(
    "/v1/condominiums",
    { onRequest: authMiddleware },
    condominiumController.getAll,
  );
  app.post(
    "/v1/condominiums",
    {
      onRequest: [authMiddleware, requireRole(Role.MANAGER, Role.SUPER_ADMIN)],
    },
    condominiumController.create,
  );

  // ========================================
  // APARTMENT ROUTES (MANAGER + SUPER_ADMIN)
  // ========================================
  app.get(
    "/v1/apartments",
    { onRequest: authMiddleware },
    apartmentController.getAll,
  );
  app.post(
    "/v1/apartments",
    {
      onRequest: [authMiddleware, requireRole(Role.MANAGER, Role.SUPER_ADMIN)],
    },
    apartmentController.create,
  );

  // ========================================
  // RESIDENT ROUTES (MANAGER + SUPER_ADMIN)
  // ========================================
  app.get(
    "/v1/residents",
    { onRequest: authMiddleware },
    residentController.getAll,
  );

  // ========================================
  // INVOICE ROUTES (ALL AUTHENTICATED)
  // ========================================
  app.get(
    "/v1/invoices",
    { onRequest: authMiddleware },
    invoiceController.getAll,
  );
  app.get(
    "/v1/invoices/:id",
    { onRequest: authMiddleware },
    invoiceController.getById,
  );
  app.patch(
    "/v1/invoices/:id",
    { onRequest: authMiddleware },
    invoiceController.updateStatus,
  );
  app.post(
    "/v1/invoices/import",
    {
      onRequest: [authMiddleware, requireRole(Role.MANAGER, Role.SUPER_ADMIN)],
    },
    invoiceController.importInvoices,
  );

  // ========================================
  // DASHBOARD ROUTES (ROLE SPECIFIC)
  // ========================================
  app.get(
    "/v1/dashboard/manager",
    { onRequest: [authMiddleware, requireRole(Role.MANAGER)] },
    dashboardController.getManagerDashboard,
  );
  app.get(
    "/v1/dashboard/resident",
    { onRequest: [authMiddleware, requireRole(Role.RESIDENT)] },
    dashboardController.getResidentDashboard,
  );

  // ========================================
  // HEALTH CHECK
  // ========================================
  app.get("/v1/health", async () => {
    return { status: "ok" };
  });
}
