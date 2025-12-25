import { revalidatePath } from "next/cache";
import "server-only";
import prisma from "../prisma";
import { WorkflowExecutionStatus } from "../types";
import { runScheduler } from "./engine/scheduler";

/**
 * Engine V2: Execute workflow using the new scheduler-based system
 * 
 * This replaces the old phase-based execution with the dynamic scheduler.
 * The scheduler handles:
 * - Dynamic step discovery
 * - Parallel execution
 * - Pause/resume
 * - Control-flow (IF/ELSE, FOREACH)
 * - Automatic CAPTCHA detection and pausing
 */
export async function executeWorkflow(executionId: string, nextRunAt?: Date) {
  console.log(`[executeWorkflow] Starting execution: ${executionId}`);

  try {
    // Use Engine V2 scheduler
    await runScheduler(executionId);

    console.log(`[executeWorkflow] Completed execution: ${executionId}`);
    revalidatePath(`/workflow/runs`);
  } catch (error: any) {
    console.error(`[executeWorkflow] Error in execution ${executionId}:`, error);

    // Mark execution as failed
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: WorkflowExecutionStatus.FAILED,
        completedAt: new Date(),
      },
    }).catch(err => console.error("Failed to update execution status:", err));

    throw error;
  }
}
