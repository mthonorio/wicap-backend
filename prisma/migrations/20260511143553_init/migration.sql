-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'RESIDENT');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingFollowUpStatus" AS ENUM ('ATRASADO', 'CONTATO_FEITO', 'EM_ACORDO', 'JURIDICO', 'QUITADO');

-- CreateEnum
CREATE TYPE "CorrectionIndex" AS ENUM ('INPC', 'IPCA', 'IGPM', 'SELIC');

-- CreateEnum
CREATE TYPE "InterestMode" AS ENUM ('SIMPLE', 'COMPOUND', 'NONE');

-- CreateEnum
CREATE TYPE "InstallmentCalculationType" AS ENUM ('DEBT', 'COST');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RESIDENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condominiums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cnpj" TEXT,
    "zip_code" TEXT,
    "city" TEXT,
    "state" TEXT,
    "manager_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "condominiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartments" (
    "id" TEXT NOT NULL,
    "block" TEXT,
    "number" TEXT NOT NULL,
    "areaM2" DECIMAL(10,2),
    "fractionPct" DECIMAL(10,4),
    "condominium_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apartments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "apartment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_settings" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "multaPercent" DECIMAL(5,2) NOT NULL,
    "jurosPercentDia" DECIMAL(5,4) NOT NULL,
    "correcaoPercent" DECIMAL(5,2),
    "graceDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "condominium_id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "number" TEXT,
    "type" TEXT,
    "competence" TEXT,
    "amountOriginal" DECIMAL(12,2) NOT NULL,
    "amountJuros" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountMulta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountCorrecao" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountTotal" DECIMAL(12,2) NOT NULL,
    "lastCalculatedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daysLate" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_documents" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_cases" (
    "id" TEXT NOT NULL,
    "condominium_id" TEXT NOT NULL,
    "apartment_id" TEXT,
    "resident_id" TEXT,
    "debtorName" TEXT,
    "debtorEmail" TEXT,
    "debtorPhone" TEXT,
    "amountOriginal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountCorrection" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountInterest" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountPenalty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountFees" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "correctionIndex" "CorrectionIndex" NOT NULL,
    "interestMode" "InterestMode" NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "penaltyRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "feeRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" "BillingFollowUpStatus" NOT NULL DEFAULT 'ATRASADO',
    "daysLate" INTEGER NOT NULL DEFAULT 0,
    "nextAction" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "billing_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_case_invoices" (
    "id" TEXT NOT NULL,
    "billing_case_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "correctionPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "correctedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "interestAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updatedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "calculationType" "InstallmentCalculationType" NOT NULL DEFAULT 'DEBT',
    "penaltyRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_case_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_histories" (
    "id" TEXT NOT NULL,
    "billing_case_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_agreements" (
    "id" TEXT NOT NULL,
    "billing_case_id" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "installmentsCount" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_fee_reports" (
    "id" TEXT NOT NULL,
    "billing_case_id" TEXT NOT NULL,
    "referenceDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "feeAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_fee_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_document_key" ON "users"("document");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_document_idx" ON "users"("document");

-- CreateIndex
CREATE UNIQUE INDEX "managers_user_id_key" ON "managers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "condominiums_cnpj_key" ON "condominiums"("cnpj");

-- CreateIndex
CREATE INDEX "condominiums_manager_id_idx" ON "condominiums"("manager_id");

-- CreateIndex
CREATE INDEX "apartments_condominium_id_idx" ON "apartments"("condominium_id");

-- CreateIndex
CREATE UNIQUE INDEX "apartments_block_number_condominium_id_key" ON "apartments"("block", "number", "condominium_id");

-- CreateIndex
CREATE UNIQUE INDEX "residents_user_id_key" ON "residents"("user_id");

-- CreateIndex
CREATE INDEX "residents_apartment_id_idx" ON "residents"("apartment_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_settings_condominiumId_key" ON "billing_settings"("condominiumId");

-- CreateIndex
CREATE INDEX "invoices_manager_id_status_dueDate_idx" ON "invoices"("manager_id", "status", "dueDate");

-- CreateIndex
CREATE INDEX "invoices_manager_id_id_idx" ON "invoices"("manager_id", "id");

-- CreateIndex
CREATE INDEX "invoices_condominium_id_status_dueDate_idx" ON "invoices"("condominium_id", "status", "dueDate");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoice_documents_invoiceId_idx" ON "invoice_documents"("invoiceId");

-- CreateIndex
CREATE INDEX "billing_cases_condominium_id_status_idx" ON "billing_cases"("condominium_id", "status");

-- CreateIndex
CREATE INDEX "billing_cases_resident_id_idx" ON "billing_cases"("resident_id");

-- CreateIndex
CREATE INDEX "billing_cases_apartment_id_idx" ON "billing_cases"("apartment_id");

-- CreateIndex
CREATE INDEX "billing_cases_status_idx" ON "billing_cases"("status");

-- CreateIndex
CREATE INDEX "billing_cases_nextAction_idx" ON "billing_cases"("nextAction");

-- CreateIndex
CREATE INDEX "billing_case_invoices_billing_case_id_idx" ON "billing_case_invoices"("billing_case_id");

-- CreateIndex
CREATE INDEX "billing_case_invoices_invoice_id_idx" ON "billing_case_invoices"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_case_invoices_billing_case_id_invoice_id_key" ON "billing_case_invoices"("billing_case_id", "invoice_id");

-- CreateIndex
CREATE INDEX "billing_histories_billing_case_id_idx" ON "billing_histories"("billing_case_id");

-- CreateIndex
CREATE INDEX "billing_histories_date_idx" ON "billing_histories"("date");

-- CreateIndex
CREATE INDEX "billing_agreements_billing_case_id_idx" ON "billing_agreements"("billing_case_id");

-- CreateIndex
CREATE INDEX "billing_agreements_active_idx" ON "billing_agreements"("active");

-- CreateIndex
CREATE INDEX "billing_fee_reports_referenceDate_idx" ON "billing_fee_reports"("referenceDate");

-- AddForeignKey
ALTER TABLE "managers" ADD CONSTRAINT "managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condominiums" ADD CONSTRAINT "condominiums_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "managers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_condominium_id_fkey" FOREIGN KEY ("condominium_id") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_settings" ADD CONSTRAINT "billing_settings_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_condominium_id_fkey" FOREIGN KEY ("condominium_id") REFERENCES "condominiums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_documents" ADD CONSTRAINT "invoice_documents_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_cases" ADD CONSTRAINT "billing_cases_condominium_id_fkey" FOREIGN KEY ("condominium_id") REFERENCES "condominiums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_cases" ADD CONSTRAINT "billing_cases_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_cases" ADD CONSTRAINT "billing_cases_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_case_invoices" ADD CONSTRAINT "billing_case_invoices_billing_case_id_fkey" FOREIGN KEY ("billing_case_id") REFERENCES "billing_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_case_invoices" ADD CONSTRAINT "billing_case_invoices_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_histories" ADD CONSTRAINT "billing_histories_billing_case_id_fkey" FOREIGN KEY ("billing_case_id") REFERENCES "billing_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_agreements" ADD CONSTRAINT "billing_agreements_billing_case_id_fkey" FOREIGN KEY ("billing_case_id") REFERENCES "billing_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_fee_reports" ADD CONSTRAINT "billing_fee_reports_billing_case_id_fkey" FOREIGN KEY ("billing_case_id") REFERENCES "billing_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
