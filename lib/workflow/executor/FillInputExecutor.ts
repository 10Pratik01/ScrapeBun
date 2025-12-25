import { ExecutionEnv, StepResult } from "../engine/types";

export async function FillInputExecutor(
  env: ExecutionEnv
): Promise<StepResult> {
  try {
    const selector = env.getInput("Selector");
    if (!selector) {
      env.log.error("Selector is required");
      return { type: "fail", error: "Selector input is missing" };
    }

    const value = env.getInput("Value");
    if (!value) {
      env.log.error("Value is required");
      return { type: "fail", error: "Value input is missing" };
    }

    const page = env.getPage();
    if (!page) {
      return { type: "fail", error: "No page available" };
    }

    await page.type(selector, value);
    env.log.info(`Filled input ${selector}`);

    return {
      type: "success",
      outputs: { "Filled": "true" },
    };
  } catch (error: any) {
    env.log.error(error.message);
    return { type: "fail", error: error.message };
  }
}
