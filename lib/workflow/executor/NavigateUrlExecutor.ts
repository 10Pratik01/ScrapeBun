import { ExecutionEnviornment } from "@/lib/types";
import { NavigateUrlTask } from "../task/NavigateUrl";
import { autoDetectPageType } from "../utils/pageDetection";

export async function NavigateUrlExecutor(
  enviornment: ExecutionEnviornment<typeof NavigateUrlTask>
): Promise<boolean> {
  try {
    const url = enviornment.getInput("Url");
    if (!url) {
      enviornment.log.error("input -> Url is not defined");
      return false;
    }

    await enviornment.getPage()!.goto(url, { waitUntil: "networkidle2" });
    enviornment.log.info(`Visited ${url}`);

    // 🎯 AUTO-DETECTION: Check page after navigation
    const page = enviornment.getPage()!;
    const detection = await autoDetectPageType(page);

    if (detection.detected && detection.confidence > 0.5) {
      enviornment.log.info(
        `🔍 Auto-Detection: ${detection.message} (confidence: ${(detection.confidence * 100).toFixed(0)}%)`
      );

      if (detection.type === "captcha") {
        enviornment.log.error(
          "⚠️ CAPTCHA DETECTED after navigation! Consider using WAIT_FOR_USER_INPUT."
        );
      } else if (detection.type === "login") {
        enviornment.log.info(
          "🔐 Redirected to login page. You may need to authenticate first."
        );
      } else if (detection.type === "error") {
        enviornment.log.error(
          `❌ Error page: ${detection.message}. URL may be incorrect or blocked.`
        );
      }
    }

    return true;
  } catch (error: any) {
    enviornment.log.error(error.message);
    return false;
  }
}
