import { ExecutionEnviornment } from "@/lib/types";
import { ExtractDataWithAiTask } from "../task/ExtractDataWithAi";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/credential";
import OpenAi from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const provider = enviornment.getInput("Provider");
    if (!provider) {
      enviornment.log.error("input -> provider is not defined");
      return false;
    }
    const model = enviornment.getInput("Model");
    if (!model) {
      enviornment.log.error("input -> model is not defined");
      return false;
    }

    const credential = await prisma.credential.findUnique({
      where: {
        id: credentialId,
      },
    });

    if (!credential) {
      enviornment.log.error("Credential not found");
      return false;
    }

    const plainCredentialValue = symmetricDecrypt(credential.value);

    if (!plainCredentialValue) {
      enviornment.log.error("Cannot decrypt credential");
      return false;
    }

    let result = "";

    if (provider === "openai") {
      const openAi = new OpenAi({
        apiKey: plainCredentialValue,
      });

      const response = await openAi.chat.completions.create({
        model: model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a webscraper helper that extracts data from HTML or text. You will be given a piece of text or HTML content as input and also the prompt with the data you have to extract. The response should always be only the extracted data as a JSON array or object, without any additional words or explanations. Analyze the input carefully and extract data precisely based on the prompt. If no data is found, return an empty JSON array. Work only with the provided content and ensure the output is always a valid JSON array without any surrounding text",
          },
          {
            role: "user",
            content: content,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 1,
      });

      enviornment.log.info(
        `Prompt tokens used: ${JSON.stringify(response.usage?.prompt_tokens)}`
      );
      enviornment.log.info(
        `Completition tokens used: ${JSON.stringify(
          response.usage?.completion_tokens
        )}`
      );

      result = response.choices[0].message?.content || "";
    } else if (provider === "google") {
      if (!plainCredentialValue.startsWith("AIza")) {
        enviornment.log.error(
          "Invalid Google API Key format. It should start with AIza. Please check your credential value."
        );
        return false;
      }

      try {
        const genAI = new GoogleGenerativeAI(plainCredentialValue);
        const modelId = model || "gemini-1.5-flash";
        const geminiModel = genAI.getGenerativeModel({
          model: modelId,
        });

        const systemPrompt =
          "You are a webscraper helper that extracts data from HTML or text. You will be given a piece of text or HTML content as input and also the prompt with the data you have to extract. The response should always be only the extracted data as a JSON array or object, without any additional words or explanations. Analyze the input carefully and extract data precisely based on the prompt. If no data is found, return an empty JSON array. Work only with the provided content and ensure the output is always a valid JSON array without any surrounding text. Do not include markdown code blocks or any other text.";

        const finalPrompt = `
        System: ${systemPrompt}
        Content: ${content}
        Extraction Prompt: ${prompt}
        `;

        const response = await geminiModel.generateContent(finalPrompt);
        let text = response.response.text();

        // Manual JSON cleaning since we removed responseMimeType for stability
        if (text.trim().startsWith("```")) {
          text = text.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
        }
        result = text.trim();

        const usageMetadata = (response.response as any).usageMetadata;
        if (usageMetadata) {
          enviornment.log.info(
            `Prompt tokens used: ${usageMetadata.promptTokenCount}`
          );
          enviornment.log.info(
            `Candidates tokens used: ${usageMetadata.candidatesTokenCount}`
          );
        }
      } catch (error: any) {
        enviornment.log.error(`Gemini Error: ${error.message}`);
        if (error.message.includes("429")) {
          enviornment.log.error(
            "Quota Exceeded. Please wait a minute before retrying or switch to a model like 'Gemini 1.5 Flash 8B' which often has higher rate limits."
          );
        } else if (error.message.includes("404")) {
          enviornment.log.error(
            "Model Not Found. This usually means the model ID is deprecated or not available in your project/region. Try 'Gemini 1.5 Flash 8B' or 'Gemini 2.0 Flash'."
          );
        }
        return false;
      }
    } else {
      enviornment.log.error(`Unsupported provider: ${provider}`);
      return false;
    }

    if (!result) {
      enviornment.log.error("Empty response from AI");
      return false;
    }

    enviornment.setOutput("Extracted Data", result);

    return true;
  } catch (error: any) {
    enviornment.log.error(error.message);
    return false;
  }
}
