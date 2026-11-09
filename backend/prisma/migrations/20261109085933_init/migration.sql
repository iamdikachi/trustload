-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TRAVELER', 'VENDOR');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('SETUP', 'FUNDING', 'ACTIVE', 'SETTLING', 'CLOSED');

-- CreateEnum
CREATE TYPE "SharedCostRule" AS ENUM ('PROPORTIONAL_TO_VALUE', 'EQUAL', 'BY_CONTRIBUTION');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReleaseRequestStatus" AS ENUM ('PENDING', 'PENDING_VERIFICATION', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'RELEASED');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CONTRIBUTION', 'STAGED_RELEASE', 'RECEIPT_SPEND', 'REFUND', 'REVERSAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VENDOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "traveler_id" TEXT NOT NULL,
    "status" "GroupStatus" NOT NULL DEFAULT 'SETUP',
    "approval_threshold" INTEGER NOT NULL DEFAULT 1,
    "shared_cost_rule" "SharedCostRule" NOT NULL DEFAULT 'PROPORTIONAL_TO_VALUE',
    "base_currency" TEXT NOT NULL DEFAULT 'USD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contribution_expected" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_lines" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "budget" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paypal_order_id" TEXT NOT NULL,
    "paypal_capture_id" TEXT,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_requests" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "supplier" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "original_amount" DECIMAL(14,2) NOT NULL,
    "fx_rate" DECIMAL(18,6) NOT NULL DEFAULT 1.0,
    "fx_rate_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_language" TEXT,
    "invoice_file" TEXT NOT NULL,
    "ai_report" JSONB,
    "status" "ReleaseRequestStatus" NOT NULL DEFAULT 'PENDING',
    "paypal_payout_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "release_request_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "decision" "ApprovalDecision" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "ai_extraction" JSONB,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "original_amount" DECIMAL(14,2) NOT NULL,
    "fx_rate" DECIMAL(18,6) NOT NULL DEFAULT 1.0,
    "fx_rate_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_language" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "goods_total" DECIMAL(14,2) NOT NULL,
    "shared_cost_share" DECIMAL(14,2) NOT NULL,
    "net_owed_or_refund" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "member_id" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "original_amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "fx_rate" DECIMAL(18,6) NOT NULL DEFAULT 1.0,
    "fx_rate_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paypal_ref" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "groups_traveler_id_idx" ON "groups"("traveler_id");

-- CreateIndex
CREATE INDEX "members_group_id_idx" ON "members"("group_id");

-- CreateIndex
CREATE INDEX "members_user_id_idx" ON "members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_group_id_user_id_key" ON "members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "order_lines_group_id_idx" ON "order_lines"("group_id");

-- CreateIndex
CREATE INDEX "order_lines_member_id_idx" ON "order_lines"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_paypal_order_id_key" ON "contributions"("paypal_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_paypal_capture_id_key" ON "contributions"("paypal_capture_id");

-- CreateIndex
CREATE INDEX "contributions_member_id_idx" ON "contributions"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "release_requests_paypal_payout_id_key" ON "release_requests"("paypal_payout_id");

-- CreateIndex
CREATE INDEX "release_requests_group_id_idx" ON "release_requests"("group_id");

-- CreateIndex
CREATE INDEX "approvals_release_request_id_idx" ON "approvals"("release_request_id");

-- CreateIndex
CREATE INDEX "approvals_member_id_idx" ON "approvals"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_release_request_id_member_id_key" ON "approvals"("release_request_id", "member_id");

-- CreateIndex
CREATE INDEX "receipts_group_id_idx" ON "receipts"("group_id");

-- CreateIndex
CREATE INDEX "allocations_group_id_idx" ON "allocations"("group_id");

-- CreateIndex
CREATE INDEX "allocations_member_id_idx" ON "allocations"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "allocations_group_id_member_id_key" ON "allocations"("group_id", "member_id");

-- CreateIndex
CREATE INDEX "ledger_entries_group_id_idx" ON "ledger_entries"("group_id");

-- CreateIndex
CREATE INDEX "ledger_entries_member_id_idx" ON "ledger_entries"("member_id");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_requests" ADD CONSTRAINT "release_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_release_request_id_fkey" FOREIGN KEY ("release_request_id") REFERENCES "release_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
