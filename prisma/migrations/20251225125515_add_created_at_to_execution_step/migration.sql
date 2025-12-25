-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExecutionStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
INSERT INTO "new_ExecutionStep" ("completedAt", "creditsConsumed", "creditsReserved", "dependencies", "error", "executionId", "id", "inputs", "nodeId", "nodeType", "outputs", "pauseReason", "startedAt", "status", "userId") SELECT "completedAt", "creditsConsumed", "creditsReserved", "dependencies", "error", "executionId", "id", "inputs", "nodeId", "nodeType", "outputs", "pauseReason", "startedAt", "status", "userId" FROM "ExecutionStep";
DROP TABLE "ExecutionStep";
ALTER TABLE "new_ExecutionStep" RENAME TO "ExecutionStep";
CREATE INDEX "ExecutionStep_executionId_status_idx" ON "ExecutionStep"("executionId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
