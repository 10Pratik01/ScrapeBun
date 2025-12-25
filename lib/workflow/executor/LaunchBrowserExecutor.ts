import { ExecutionEnv, StepResult } from "../engine/types";
import puppeteer from "puppeteer";

export async function LaunchBrowserExecutor(
  env: ExecutionEnv
): Promise<StepResult> {
  try {
    const websiteUrl = env.getInput("Website Url");

    if (!websiteUrl) {
      env.log.error("Website URL is required");
      return { type: "fail", error: "Website URL input is missing" };
    }

    env.log.info(`Launching browser for: ${websiteUrl}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    env.log.info("Browser started successfully");
    env.setBrowser(browser);

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    env.log.info(`Navigating to: ${websiteUrl}`);
    await page.goto(websiteUrl, { waitUntil: "networkidle2", timeout: 30000 });

    env.setPage(page);
    env.log.info(`✓ Successfully opened page at: ${websiteUrl}`);

    return {
      type: "success",
      outputs: {
        "Web page": "Browser instance created",
        "Browser Instance": "active",
      },
    };
  } catch (error: any) {
    env.log.error(`LAUNCH_BROWSER error: ${error.message}`);
    return { type: "fail", error: error.message };
  }
}
