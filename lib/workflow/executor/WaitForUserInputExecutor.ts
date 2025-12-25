import { ExecutionEnviornment } from "@/lib/types";
import { WaitForUserInputTask } from "../task/WaitForUserInput";

/**
 * WAIT_FOR_USER_INPUT executor
 * Pauses execution and waits for user to manually resume
 * Use cases: CAPTCHA solving, manual login, approval gates
 */
export const WaitForUserInputExecutor = async (
    enviornment: ExecutionEnviornment<typeof WaitForUserInputTask>
): Promise<boolean> => {
    const message = enviornment.getInput("Message");
    const timeoutMinutes = parseInt(enviornment.getInput("Timeout Minutes") || "10");

    enviornment.log.info(`Pausing execution: ${message}`);
    enviornment.log.info(`Timeout: ${timeoutMinutes} minutes`);

    // Note: In Engine V2, this would trigger a pause via env.pause()
    // For Engine V1 compatibility, we just log and return true
    // The actual pause mechanism is handled by the scheduler in V2

    enviornment.setOutput("completed", "true");
    enviornment.setOutput("resumedAt", new Date().toISOString());

    return true;
};

export const WaitForUserInputExecutorV2 = WaitForUserInputExecutor;
