import { ExecutionEnv, StepResult } from "../engine/types";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/credential";
import { GoogleGenAI } from "@google/genai";

export async function ExtractDataWithAiExecutor(
  env: ExecutionEnv
): Promise<StepResult> {
  try {
    const credentialId = env.getInput("Credentials");
    if (!credentialId) {
      return { type: "fail", error: "Credentials input is missing" };
    }

    const content = env.getInput("Content");
    if (!content) {
      return { type: "fail", error: "Content input is missing" };
    }

    const userPrompt = env.getInput("Prompt");
    if (!userPrompt) {
      return { type: "fail", error: "Prompt input is missing" };
    }

    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      return { type: "fail", error: "Credential not found" };
    }

    const apiKey = symmetricDecrypt(credential.value);
    if (!apiKey) {
      return { type: "fail", error: "Cannot decrypt credential" };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Built-in rules for consistent JSON output
    const systemRules = `IMPORTANT RULES:
• Output ONLY a valid JSON array
• No explanations
• No markdown
• If nothing is found, return []

USER PROMPT:
${userPrompt}`;

    // Send content and enhanced prompt to AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: content }],
        },
        {
          role: "user",
          parts: [{ text: systemRules }],
        },
      ],
    });

    env.log.info(
      `Prompt tokens: ${response.usageMetadata?.promptTokenCount}`
    );
    env.log.info(
      `Completion tokens: ${response.usageMetadata?.candidatesTokenCount}`
    );

    const result = response.text?.trim();

    if (!result) {
      return { type: "fail", error: "Empty response from Gemini" };
    }

    // Ensure valid JSON
    try {
      JSON.parse(result);
    } catch {
      return { type: "fail", error: "Gemini response is not valid JSON" };
    }

    return {
      type: "success",
      outputs: { "Extracted Data": result },
    };
  } catch (error: any) {
    env.log.error(error.message ?? "Unknown Gemini error");
    return { type: "fail", error: error.message };
  }
}
