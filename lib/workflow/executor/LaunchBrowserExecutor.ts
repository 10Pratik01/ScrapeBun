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

    // Configure browser executable path for production environments
    const launchOptions: any = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    };

    // Try to use system Chrome in production (Vercel, AWS, etc.)
    if (process.env.NODE_ENV === "production") {
      // Common paths for Chrome in production environments
      const chromePaths = [
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        process.env.CHROME_PATH, // Allow custom path via env variable
      ].filter(Boolean);

      // Try each path
      for (const path of chromePaths) {
        try {
          const fs = require("fs");
          if (path && fs.existsSync(path)) {
            launchOptions.executablePath = path;
            env.log.info(`Using Chrome at: ${path}`);
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
    }

    const browser = await puppeteer.launch(launchOptions);

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
