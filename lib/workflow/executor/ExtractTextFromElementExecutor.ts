import { ExecutionEnv, StepResult } from "../engine/types";
import * as cheerio from "cheerio";

export async function ExtractTextFromElement(
  env: ExecutionEnv
): Promise<StepResult> {
  try {
    const selector = env.getInput("Selector");
    if (!selector) {
      env.log.error("Selector not defined");
      return { type: "fail", error: "Selector input is missing" };
    }

    const html = env.getInput("Html");
    if (!html) {
      env.log.error("HTML not defined");
      return { type: "fail", error: "HTML input is missing" };
    }

    const $ = cheerio.load(html);
    const element = $(selector);

    if (!element || element.length === 0) {
      env.log.error("Element not found on selector");
      return { type: "fail", error: `Element not found: ${selector}` };
    }

    const extractedText = element.text().trim();
    if (!extractedText) {
      env.log.error("Element has no text");
      return { type: "fail", error: "Element has no text content" };
    }

    env.log.info(`Extracted text from ${selector}`);

    return {
      type: "success",
      outputs: { "Extracted Text": extractedText },
    };
  } catch (error: any) {
    env.log.error(error.message);
    return { type: "fail", error: error.message };
  }
}
