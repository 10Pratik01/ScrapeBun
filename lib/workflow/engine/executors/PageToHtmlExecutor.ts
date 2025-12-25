import { StepExecutor, StepResult, ExecutionEnv } from "../types";
import { autoDetectPageType } from "../../utils/pageDetection";
import prisma from "@/lib/prisma";

/**
 * PAGE_TO_HTML executor for Engine V2
 * Now with AUTOMATIC CAPTCHA and page type detection + SNAPSHOT STORAGE
 */
export const PageToHtmlExecutorV2: StepExecutor = async (
    env: ExecutionEnv
): Promise<StepResult> => {
    try {
        const page = env.getPage();
        if (!page) {
            env.log.error("No page available");
            return { type: "fail", error: "No page available" };
        }

        const html = await page.content();
        const url = page.url();

        // 📸 PHASE 12: Save snapshot to database for reuse
        try {
            await prisma.scrapeSnapshot.upsert({
                where: {
                    executionId_nodeId: {
                        executionId: env.executionId,
                        nodeId: env.nodeId,
                    },
                },
                update: {
                    html,
                    url,
                    timestamp: new Date(),
                },
                create: {
                    executionId: env.executionId,
                    nodeId: env.nodeId,
                    url,
                    html,
                },
            });
            env.log.info(`📸 Snapshot saved for ${url}`);
        } catch (snapshotError: any) {
            env.log.error(`Warning: Could not save snapshot: ${snapshotError.message}`);
            // Don't fail the whole step if snapshot fails
        }

        // 🎯 AUTOMATIC DETECTION: Check for CAPTCHA, login pages, errors
        env.log.info("🔍 Running automatic page detection...");
        const detection = await autoDetectPageType(page);

        if (detection.detected && detection.confidence > 0.5) {
            env.log.info(
                `🔍 Detected: ${detection.type.toUpperCase()} (confidence: ${(detection.confidence * 100).toFixed(0)}%)`
            );

            // 🚨 AUTOMATIC CAPTCHA HANDLING: Pause execution automatically
            if (detection.type === "captcha") {
                env.log.error(
                    `⚠️ CAPTCHA DETECTED! Automatically pausing execution for manual intervention.`
                );
                env.log.info(
                    `📍 Current URL: ${page.url()}`
                );
                env.log.info(
                    `ℹ️ Solve the CAPTCHA manually, then resume execution via the UI or API.`
                );

                // Trigger automatic pause - no manual node needed!
                return {
                    type: "pause",
                    reason: {
                        type: "MANUAL_INTERVENTION",
                        message: `CAPTCHA detected at ${page.url()}. Please solve it and resume execution.`,
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

            // Log other detections but don't pause
            if (detection.type === "login") {
                env.log.info(
                    "🔐 Login page detected. Use FILL_INPUT and CLICK_ELEMENT to complete login."
                );
            } else if (detection.type === "signup") {
                env.log.info(
                    "📝 Signup page detected. Use form filling nodes to complete registration."
                );
            } else if (detection.type === "error") {
                env.log.error(`❌ Error page: ${detection.message}`);
            }
        } else {
            env.log.info("✓ No special page type detected, continuing normally");
        }

        // Return HTML with detection metadata
        return {
            type: "success",
            outputs: {
                HTML: html,
                webPage: html,
                pageType: detection.detected ? detection.type : "normal",
                detectionConfidence: detection.confidence.toString(),
                requiresManualIntervention:
                    detection.type === "captcha" ? "true" : "false",
            },
        };
    } catch (error: any) {
        env.log.error(`PAGE_TO_HTML error: ${error.message}`);
        return { type: "fail", error: error.message };
    }
};
