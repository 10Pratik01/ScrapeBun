import { StepExecutor, StepResult, ExecutionEnv } from "../types";

/**
 * WAIT_FOR_USER_INPUT executor for Engine V2
 * Pauses execution and waits for user to manually resume
 * 
 * Use cases:
 * - CAPTCHA solving
 * - Manual login (2FA)
 * - Manual approval/verification
 * - Human-in-the-loop validation
 */
export const WaitForUserInputExecutorV2: StepExecutor = async (
    env: ExecutionEnv
): Promise<StepResult> => {
    const message = env.getInput("Message") || "Waiting for user input";
    const timeoutMinutes = parseInt(env.getInput("Timeout Minutes") || "10");

    env.log.info(`⏸️  Execution paused: ${message}`);
    env.log.info(`⏱️  Timeout: ${timeoutMinutes} minutes`);
    env.log.info(`📍 Current page: ${env.getPage()?.url() || "No page loaded"}`);

    // Trigger pause - scheduler will mark step as WAITING
    // User must manually resume via UI or API
    env.pause({
        type: "MANUAL_INTERVENTION",
        message: message,
        timestamp: new Date(),
        metadata: {
            timeoutMinutes,
            requiresHumanAction: true,
            reason: "CAPTCHA or manual verification required",
        },
    });

    // This will cause the executor to return a pause result
    // The scheduler will catch this and mark the execution as WAITING
    return {
        type: "pause",
        reason: {
            type: "MANUAL_INTERVENTION",
            message: message,
            timestamp: new Date(),
            metadata: {
                timeoutMinutes,
                pageUrl: env.getPage()?.url(),
            },
        },
    };
};
