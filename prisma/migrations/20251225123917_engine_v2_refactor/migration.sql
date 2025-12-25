/*
  Warnings:

  - You are about to drop the `ExecutionPhase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `executionPhaseId` on the `ExecutionLog` table. All the data in the column will be lost.
  - Added the required column `executionStepId` to the `ExecutionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkflowExecution" ADD COLUMN "cursor" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ExecutionPhase";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ExecutionStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "inputs" TEXT,
    "outputs" TEXT,
    "dependencies" TEXT NOT NULL DEFAULT '[]',
    "creditsReserved" INTEGER NOT NULL DEFAULT 0,
    "creditsConsumed" INTEGER NOT NULL DEFAULT 0,
    "pauseReason" TEXT,
    "error" TEXT,
    CONSTRAINT "ExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScrapeSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExecutionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logLevel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executionStepId" TEXT NOT NULL,
    CONSTRAINT "ExecutionLog_executionStepId_fkey" FOREIGN KEY ("executionStepId") REFERENCES "ExecutionStep" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ExecutionLog" ("id", "logLevel", "message", "timestamp") SELECT "id", "logLevel", "message", "timestamp" FROM "ExecutionLog";
DROP TABLE "ExecutionLog";
ALTER TABLE "new_ExecutionLog" RENAME TO "ExecutionLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ExecutionStep_executionId_status_idx" ON "ExecutionStep"("executionId", "status");

-- CreateIndex
CREATE INDEX "ScrapeSnapshot_executionId_idx" ON "ScrapeSnapshot"("executionId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeSnapshot_executionId_nodeId_key" ON "ScrapeSnapshot"("executionId", "nodeId");
