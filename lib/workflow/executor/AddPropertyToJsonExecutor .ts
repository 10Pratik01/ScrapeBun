import { ExecutionEnv, StepResult } from "../engine/types";

export async function AddPropertyToJsonExecutor(
  env: ExecutionEnv
): Promise<StepResult> {
  try {
    const jsonData = env.getInput("JSON");
    if (!jsonData) {
      return { type: "fail", error: "JSON input is missing" };
    }

    const propertyName = env.getInput("Property name");
    if (!propertyName) {
      return { type: "fail", error: "Property name input is missing" };
    }

    const propertyValue = env.getInput("Property value");
    if (!propertyValue) {
      return { type: "fail", error: "Property value input is missing" };
    }

    const json = JSON.parse(jsonData);
    json[propertyName] = propertyValue;
    const updatedJson = JSON.stringify(json);

    return {
      type: "success",
      outputs: { "Updated JSON": updatedJson },
    };
  } catch (error: any) {
    env.log.error(error.message);
    return { type: "fail", error: error.message };
  }
}
