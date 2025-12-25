import { ExecutionEnv, StepResult } from "../engine/types";

/**
 * MERGE Executor - Combines multiple inputs into a single JSON output
 * 
 * This node accepts MULTIPLE incoming connections from other nodes.
 * All connected node outputs will be merged into a single output.
 * 
 * Input Parameters:
 * - Input 1, Input 2, Input 3 - STRING inputs to merge
 * - mergeStrategy: "object" | "array" - How to combine inputs
 * 
 * For "object" strategy:
 *   Merges all inputs into a single object: {"Input 1": value1, "Input 2": value2, ...}
 * 
 * For "array" strategy:
 *   Combines all inputs into an array: [value1, value2, ...]
 * 
 * Usage Example:
 * EXTRACT (title) ─┐
 * EXTRACT (desc)  ─┤
 * EXTRACT (price) ─┴─ MERGE (object) → {"Input 1": "title", "Input 2": "desc", "Input 3": "price"}
 */
export async function MergeExecutor(env: ExecutionEnv): Promise<StepResult> {
    try {
        const mergeStrategy = env.getInput("Merge Strategy") || "object";

        // Collect all inputs from Input 1, Input 2, Input 3...
        const inputs: Record<string, string> = {};
        const inputNames = ["Input 1", "Input 2", "Input 3", "Input 4", "Input 5",
            "Input 6", "Input 7", "Input 8", "Input 9", "Input 10"];

        for (const inputName of inputNames) {
            const value = env.getInput(inputName);
            if (value) {
                inputs[inputName] = value;
            }
        }

        // Check if we have any inputs
        if (Object.keys(inputs).length === 0) {
            env.log.error("No inputs to merge - please connect at least one node");
            return {
                type: "fail",
                error: "MERGE requires at least one input connection",
            };
        }

        let mergedOutput: any;

        if (mergeStrategy === "array") {
            // Merge as array: [value1, value2, value3]
            mergedOutput = Object.values(inputs);
            env.log.info(`Merged ${Object.keys(inputs).length} inputs into array`);
        } else {
            // Merge as object: {"Input 1": value1, "Input 2": value2}
            mergedOutput = inputs;
            env.log.info(`Merged ${Object.keys(inputs).length} inputs into object`);
        }

        // Return as JSON string
        const outputString = JSON.stringify(mergedOutput, null, 2);
        env.log.info(`Merge output: ${outputString.substring(0, 200)}...`);

        return {
            type: "success",
            outputs: {
                "Merged Output": outputString,
            },
        };
    } catch (error: any) {
        env.log.error("Error in MERGE executor:", error.message);
        return {
            type: "fail",
            error: error.message,
        };
    }
}
