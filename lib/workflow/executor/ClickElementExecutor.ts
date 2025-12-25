import { ExecutionEnv, StepResult } from "../engine/types";

export async function ClickElementExecutor(
  env: ExecutionEnv
): Promise<StepResult> {
  try {
    const selector = env.getInput("Selector");
    if (!selector) {
      env.log.error("Selector is required");
      return { type: "fail", error: "Selector input is missing" };
    }

    const page = env.getPage();
    if (!page) {
      return { type: "fail", error: "No page available" };
    }

    await page.click(selector);
    env.log.info(`Clicked element: ${selector}`);

    return {
      type: "success",
      outputs: { "Clicked": "true" },
    };
  } catch (error: any) {
    env.log.error(error.message);
    return { type: "fail", error: error.message };
  }
}
