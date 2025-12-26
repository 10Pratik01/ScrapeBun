import { ExecutionEnv, StepResult } from "../engine/types";

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

    let browser: any;

    // Use @sparticuz/chromium in production (Vercel, AWS Lambda, etc.)
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      env.log.info("Using @sparticuz/chromium for serverless environment");
      
      try {
        const chromium = await import("@sparticuz/chromium");
        const puppeteerCore = await import("puppeteer-core");
        
        // Get the executable path
        const executablePath = await chromium.default.executablePath();
        env.log.info(`Chromium executable path: ${executablePath}`);
        
        launchOptions.executablePath = executablePath;
        launchOptions.args = [
          ...chromium.default.args,
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-sandbox',
        ];
        
        browser = await puppeteerCore.default.launch(launchOptions);
      } catch (error: any) {
        env.log.error(`Failed to launch with @sparticuz/chromium: ${error.message}`);
        throw error;
      }
    } else {
      // Use regular puppeteer in development
      env.log.info("Using regular puppeteer for local development");
      const puppeteer = await import("puppeteer");
      browser = await puppeteer.default.launch(launchOptions);
    }

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
