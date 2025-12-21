import { ExecutionEnviornment } from "@/lib/types";
import { ExtractDataWithAiTask } from "../task/ExtractDataWithAi";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/credential";
import { GoogleGenAI } from "@google/genai";

export async function ExtractDataWithAiExecutor(
  enviornment: ExecutionEnviornment<typeof ExtractDataWithAiTask>
): Promise<boolean> {
  try {
    const credentialId = enviornment.getInput("Credentials");
    if (!credentialId) {
      enviornment.log.error("input -> credentials is not defined");
      return false;
    }

    const content = enviornment.getInput("Content");
    if (!content) {
      enviornment.log.error("input -> content is not defined");
      return false;
    }

    const prompt = enviornment.getInput("Prompt");
    if (!prompt) {
      enviornment.log.error("input -> prompt is not defined");
      return false;
    }

    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      enviornment.log.error("Credential not found");
      return false;
    }

    const apiKey = symmetricDecrypt(credential.value);
    if (!apiKey) {
      enviornment.log.error("Cannot decrypt credential");
      return false;
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // or gemini-1.5-flash for cheaper/faster, 

      contents: [
        {
          role: "user",
          parts: [{ text: content }],
        },
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],


    });

    enviornment.log.info(
      `Prompt tokens used: ${response.usageMetadata?.promptTokenCount}`
    );

    enviornment.log.info(
      `Completion tokens used: ${response.usageMetadata?.candidatesTokenCount}`
    );

    const result = response.text?.trim();

    if (!result) {
      enviornment.log.error("Empty response from Gemini");
      return false;
    }

    // Optional safety: ensure valid JSON
    try {
      JSON.parse(result);
    } catch {
      enviornment.log.error("Gemini response is not valid JSON");
      return false;
    }

    enviornment.setOutput("Extracted Data", result);
    return true;
  } catch (error: any) {
    enviornment.log.error(error.message ?? "Unknown Gemini error");
    return false;
  }
}
