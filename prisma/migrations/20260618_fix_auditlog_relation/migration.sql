-- AuditLog.entityId is polymorphic: USER / PROJECT / SPRINT / TASK.
-- It must not be constrained only to Task.id.
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_entityId_fkey";
