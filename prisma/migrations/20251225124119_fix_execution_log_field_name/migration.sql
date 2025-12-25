/*
  Warnings:

  - You are about to drop the column `logLevel` on the `ExecutionLog` table. All the data in the column will be lost.
  - Added the required column `level` to the `ExecutionLog` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExecutionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executionStepId" TEXT NOT NULL,
    CONSTRAINT "ExecutionLog_executionStepId_fkey" FOREIGN KEY ("executionStepId") REFERENCES "ExecutionStep" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ExecutionLog" ("executionStepId", "id", "message", "timestamp") SELECT "executionStepId", "id", "message", "timestamp" FROM "ExecutionLog";
DROP TABLE "ExecutionLog";
ALTER TABLE "new_ExecutionLog" RENAME TO "ExecutionLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
