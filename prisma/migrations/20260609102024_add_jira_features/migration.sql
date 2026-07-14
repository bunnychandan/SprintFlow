-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('TASK', 'BUG', 'STORY');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "originalEstimate" INTEGER,
ADD COLUMN     "timeRemaining" INTEGER,
ADD COLUMN     "timeSpent" INTEGER,
ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'TASK';
