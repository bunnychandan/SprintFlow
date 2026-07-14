-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('PROJECT_MANAGER', 'SCRUM_MASTER', 'DEVELOPER', 'TESTER', 'BUSINESS_ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_reporterId_fkey";

-- Add updatedAt to Comment (use CURRENT_TIMESTAMP as default for existing rows)
ALTER TABLE "Comment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Comment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable: Project — replace isArchived with status, add audit fields, add soft delete
ALTER TABLE "Project" DROP COLUMN "isArchived",
ADD COLUMN "createdById" TEXT,
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
ADD COLUMN "updatedById" TEXT;

-- Backfill Project.createdById from ownerId
UPDATE "Project" SET "createdById" = "ownerId" WHERE "createdById" IS NULL;
ALTER TABLE "Project" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable: ProjectMember — migrate role column type to ProjectRole
ALTER TABLE "ProjectMember" ADD COLUMN "roleInProject_new" "ProjectRole" NOT NULL DEFAULT 'VIEWER';
ALTER TABLE "ProjectMember" DROP COLUMN "roleInProject";
ALTER TABLE "ProjectMember" RENAME COLUMN "roleInProject_new" TO "roleInProject";

-- AlterTable: Sprint — add audit/tracking fields, replace status string with SprintStatus enum
ALTER TABLE "Sprint" ADD COLUMN "createdById" TEXT,
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "status_new" "SprintStatus" NOT NULL DEFAULT 'PLANNING';

-- Backfill Sprint.createdById from the project owner
UPDATE "Sprint" SET "createdById" = (SELECT "ownerId" FROM "Project" WHERE "Project"."id" = "Sprint"."projectId") WHERE "createdById" IS NULL;
ALTER TABLE "Sprint" ALTER COLUMN "createdById" SET NOT NULL;

-- Migrate Sprint.status values: 'PLANNING' maps to PLANNING, anything else defaults to ACTIVE
UPDATE "Sprint" SET "status_new" = 'PLANNING' WHERE "status" = 'PLANNING';
UPDATE "Sprint" SET "status_new" = 'ACTIVE' WHERE "status" IS NULL OR "status" NOT IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
DROP VIEW IF EXISTS "Sprint_status_migrate";
ALTER TABLE "Sprint" DROP COLUMN "status";
ALTER TABLE "Sprint" RENAME COLUMN "status_new" TO "status";

-- AlterTable: Task — add soft delete and audit fields
ALTER TABLE "Task" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "updatedById" TEXT;

-- AlterTable: User — replace Role enum with SystemRole, add soft delete
ALTER TABLE "User" ADD COLUMN "role_new" "SystemRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Migrate User.role: SUPER_ADMIN→SUPER_ADMIN, ADMIN→ADMIN, everything else→USER
UPDATE "User" SET "role_new" = 'SUPER_ADMIN' WHERE "role" = 'SUPER_ADMIN';
UPDATE "User" SET "role_new" = 'ADMIN' WHERE "role" = 'ADMIN';
UPDATE "User" SET "role_new" = 'USER' WHERE "role" IN ('USER', 'PROJECT_MANAGER', 'SCRUM_MASTER', 'DEVELOPER', 'TESTER', 'BUSINESS_ANALYST', 'VIEWER');
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" RENAME COLUMN "role_new" TO "role";

-- DropEnum (safe: all values migrated to SystemRole or ProjectRole)
DROP TYPE "Role";

-- CreateTable: Attachment
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Invitation
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "projectId" TEXT,
    "role" "ProjectRole" NOT NULL DEFAULT 'VIEWER',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "senderId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ActivityLog
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- Indexes for new tables
CREATE INDEX "Attachment_taskId_idx" ON "Attachment"("taskId");
CREATE INDEX "Attachment_userId_idx" ON "Attachment"("userId");
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX "Invitation_status_idx" ON "Invitation"("status");
CREATE INDEX "Invitation_senderId_idx" ON "Invitation"("senderId");
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- Indexes for existing tables (missing FK indexes, query performance)
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "Comment_taskId_idx" ON "Comment"("taskId");
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");
CREATE INDEX "Project_createdById_idx" ON "Project"("createdById");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_visibility_idx" ON "Project"("visibility");
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");
CREATE INDEX "Project_code_idx" ON "Project"("code");
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");
CREATE INDEX "ProjectMember_roleInProject_idx" ON "ProjectMember"("roleInProject");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Sprint_projectId_idx" ON "Sprint"("projectId");
CREATE INDEX "Sprint_createdById_idx" ON "Sprint"("createdById");
CREATE INDEX "Sprint_status_idx" ON "Sprint"("status");
CREATE INDEX "Sprint_deletedAt_idx" ON "Sprint"("deletedAt");
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX "Task_sprintId_idx" ON "Task"("sprintId");
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");
CREATE INDEX "Task_reporterId_idx" ON "Task"("reporterId");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_priority_idx" ON "Task"("priority");
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "User_email_idx" ON "User"("email");

-- New/modified foreign keys
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
