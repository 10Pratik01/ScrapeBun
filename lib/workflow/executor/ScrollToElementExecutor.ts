import { ExecutionEnv, StepResult } from "../engine/types";

export async function ScrollToElementExecutor(
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

    await page.evaluate((eleSelector) => {
      const element = document.querySelector(eleSelector);
      if (!element) {
        throw new Error("Element not found");
      }
      const eleScroll = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: eleScroll, behavior: 'smooth' });
    }, selector);

    env.log.info(`Scrolled to element: ${selector}`);

    return {
      type: "success",
      outputs: { "Scrolled": "true" },
    };
  } catch (error: any) {
    env.log.error(error.message);
    return { type: "fail", error: error.message };
  }
}
