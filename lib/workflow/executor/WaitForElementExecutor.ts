import { ExecutionEnv, StepResult } from "../engine/types";

export async function WaitForElementExecutor(
  env: ExecutionEnv
): Promise<StepResult> {
  try {
    const selector = env.getInput("Selector");
    if (!selector) {
      env.log.error("Selector is required");
      return { type: "fail", error: "Selector input is missing" };
    }

    const visibility = env.getInput("Visiblity") || env.getInput("Visibility");
    if (!visibility) {
      env.log.error("Visibility is required");
      return { type: "fail", error: "Visibility input is missing" };
    }

    const page = env.getPage();
    if (!page) {
      return { type: "fail", error: "No page available" };
    }

    await page.waitForSelector(selector, {
      visible: visibility === "visible",
      hidden: visibility === "hidden",
      timeout: 30000,
    });

    env.log.info(`Element ${selector} became: ${visibility}`);

    return {
      type: "success",
      outputs: { "Element found": "true" },
    };
  } catch (error: any) {
    env.log.error(error.message);
    return { type: "fail", error: error.message };
  }
}
