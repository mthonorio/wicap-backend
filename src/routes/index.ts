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
  app.post("/auth/login", authController.login);
  app.post("/auth/logout", authController.logout);
  app.get("/auth/me", { onRequest: authMiddleware }, authController.me);

  // ========================================
  // ADMIN ROUTES (SUPER_ADMIN ONLY)
  // ========================================
  app.get(
    "/admin/stats",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getStats,
  );
  app.get(
    "/admin/managers",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getManagers,
  );
  app.post(
    "/admin/managers",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminAuthController.createManager,
  );
  app.get(
    "/admin/residents",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getResidents,
  );
  app.get(
    "/admin/condominiums",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getCondominiums,
  );
  app.get(
    "/admin/encargos",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getEncargos,
  );
  app.get(
    "/admin/reports",
    { onRequest: [authMiddleware, requireRole(Role.SUPER_ADMIN)] },
    adminController.getReports,
  );

  // ========================================
  // CONDOMINIUM ROUTES (MANAGER + SUPER_ADMIN)
  // ========================================
  app.get(
    "/condominiums",
    { onRequest: authMiddleware },
    condominiumController.getAll,
  );
  app.post(
    "/condominiums",
    {
      onRequest: [authMiddleware, requireRole(Role.MANAGER, Role.SUPER_ADMIN)],
    },
    condominiumController.create,
  );

  // ========================================
  // APARTMENT ROUTES (MANAGER + SUPER_ADMIN)
  // ========================================
  app.get(
    "/apartments",
    { onRequest: authMiddleware },
    apartmentController.getAll,
  );
  app.post(
    "/apartments",
    {
      onRequest: [authMiddleware, requireRole(Role.MANAGER, Role.SUPER_ADMIN)],
    },
    apartmentController.create,
  );

  // ========================================
  // RESIDENT ROUTES (MANAGER + SUPER_ADMIN)
  // ========================================
  app.get(
    "/residents",
    { onRequest: authMiddleware },
    residentController.getAll,
  );

  // ========================================
  // INVOICE ROUTES (ALL AUTHENTICATED)
  // ========================================
  app.get("/invoices", { onRequest: authMiddleware }, invoiceController.getAll);
  app.get(
    "/invoices/:id",
    { onRequest: authMiddleware },
    invoiceController.getById,
  );
  app.patch(
    "/invoices/:id",
    { onRequest: authMiddleware },
    invoiceController.updateStatus,
  );
  app.post(
    "/invoices/import",
    {
      onRequest: [authMiddleware, requireRole(Role.MANAGER, Role.SUPER_ADMIN)],
    },
    invoiceController.importInvoices,
  );

  // ========================================
  // DASHBOARD ROUTES (ROLE SPECIFIC)
  // ========================================
  app.get(
    "/dashboard/manager",
    { onRequest: [authMiddleware, requireRole(Role.MANAGER)] },
    dashboardController.getManagerDashboard,
  );
  app.get(
    "/dashboard/resident",
    { onRequest: [authMiddleware, requireRole(Role.RESIDENT)] },
    dashboardController.getResidentDashboard,
  );

  // ========================================
  // HEALTH CHECK
  // ========================================
  app.get("/health", async () => {
    return { status: "ok" };
  });
}
