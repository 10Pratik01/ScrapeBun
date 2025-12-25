import { StepExecutor, StepResult, ExecutionEnv } from "../types";
import { autoDetectPageType } from "../../utils/pageDetection";

/**
 * NAVIGATE_URL executor for Engine V2
 * Now with AUTOMATIC CAPTCHA and page type detection
 */
export const NavigateUrlExecutorV2: StepExecutor = async (
    env: ExecutionEnv
): Promise<StepResult> => {
    try {
        const url = env.getInput("Url");
        if (!url) {
            env.log.error("input -> Url is not defined");
            return { type: "fail", error: "URL is required" };
        }

        const page = env.getPage();
        if (!page) {
            env.log.error("No page available");
            return { type: "fail", error: "No page available" };
        }

        env.log.info(`Navigating to ${url}...`);
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 30000,
        });
        env.log.info(`✓ Successfully loaded ${url}`);

        // 🎯 AUTOMATIC DETECTION: Check page after navigation
        env.log.info("🔍 Running automatic page detection...");
        const detection = await autoDetectPageType(page);

        if (detection.detected && detection.confidence > 0.5) {
            env.log.info(
                `🔍 Detected: ${detection.type.toUpperCase()} (confidence: ${(detection.confidence * 100).toFixed(0)}%)`
            );

            // 🚨 AUTOMATIC CAPTCHA HANDLING: Pause execution automatically
            if (detection.type === "captcha") {
                env.log.error(
                    `⚠️ CAPTCHA DETECTED after navigation! Automatically pausing for manual intervention.`
                );
                env.log.info(`📍 Current URL: ${page.url()}`);
                env.log.info(
                    `ℹ️ Solve the CAPTCHA manually, then resume execution.`
                );

                return {
                    type: "pause",
                    reason: {
                        type: "MANUAL_INTERVENTION",
                        message: `CAPTCHA detected after navigating to ${url}. Please solve it and resume.`,
                        timestamp: new Date(),
                        metadata: {
                            detectionType: "captcha",
                            confidence: detection.confidence,
                            url: page.url(),
                            automatic: true,
                        },
                    },
                };
            }

            // Log other detections
            if (detection.type === "login") {
                env.log.info(
                    "🔐 Redirected to login page. You may need to authenticate first."
                );
            } else if (detection.type === "error") {
                env.log.error(
                    `❌ Error page: ${detection.message}. URL may be incorrect or blocked.`
                );
            }
        } else {
            env.log.info("✓ Page loaded successfully, no issues detected");
        }

        return {
            type: "success",
            outputs: {
                url: url,
                pageType: detection.detected ? detection.type : "normal",
                detectionConfidence: detection.confidence.toString(),
            },
        };
    } catch (error: any) {
        env.log.error(`NAVIGATE_URL error: ${error.message}`);
        return { type: "fail", error: error.message };
    }
};
