import { ExecutionEnviornment } from "@/lib/types";
import { PageToHtmlTask } from "../task/PageToHtml";
import { autoDetectPageType } from "../utils/pageDetection";

export async function PageToHtmlExecutor(
  enviornment: ExecutionEnviornment<typeof PageToHtmlTask>
): Promise<boolean> {
  try {
    const page = enviornment.getPage()!;
    const html = await page.content();

    // 🎯 AUTO-DETECTION: Check for CAPTCHA, login pages, errors
    const detection = await autoDetectPageType(page);

    if (detection.detected && detection.confidence > 0.5) {
      enviornment.log.info(
        `🔍 Auto-Detection: ${detection.message} (confidence: ${(detection.confidence * 100).toFixed(0)}%)`
      );

      // Provide actionable recommendations
      if (detection.type === "captcha") {
        enviornment.log.error(
          "⚠️ CAPTCHA DETECTED! Workflow may need manual intervention. Add 'WAIT_FOR_USER_INPUT' node to handle this."
        );
        enviornment.setOutput("pageType", "captcha");
        enviornment.setOutput("requiresManualIntervention", "true");
      } else if (detection.type === "login") {
        enviornment.log.info(
          "🔐 Login page detected. Use FILL_INPUT and CLICK_ELEMENT nodes to complete login."
        );
        enviornment.setOutput("pageType", "login");
      } else if (detection.type === "signup") {
        enviornment.log.info(
          "📝 Signup page detected. Use form filling nodes to complete registration."
        );
        enviornment.setOutput("pageType", "signup");
      } else if (detection.type === "error") {
        enviornment.log.error(
          `❌ Error page detected: ${detection.message}`
        );
        enviornment.setOutput("pageType", "error");
      }

      enviornment.setOutput("detectionConfidence", detection.confidence.toString());
    }

    enviornment.setOutput("HTML", html);
    enviornment.setOutput("webPage", html); // Alternative output name for compatibility
    return true;
  } catch (error: any) {
    enviornment.log.error(error.message);
    return false;
  }
}
