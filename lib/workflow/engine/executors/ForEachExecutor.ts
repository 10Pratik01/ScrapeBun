import { StepExecutor, StepResult, ExecutionEnv } from "../types";

/**
 * FOREACH node executor for Engine V2
 * Note: The actual iteration spawning is handled by the scheduler
 * This executor validates inputs and signals readiness
 */
export const ForEachExecutorV2: StepExecutor = async (
    env: ExecutionEnv
): Promise<StepResult> => {
    const itemsInput = env.getInput("Items") || "";
    const itemVariable = env.getInput("Item Variable") || "";

    env.log.info(`Starting FOREACH loop with variable: ${itemVariable}`);

    try {
        // Parse the items array
        let items: any[];
        try {
            items = JSON.parse(itemsInput);
        } catch (e) {
            env.log.error(`Failed to parse items as JSON: ${itemsInput}`);
            return {
                type: "fail",
                error: `Items must be a valid JSON array. Got: ${itemsInput}`,
            };
        }

        if (!Array.isArray(items)) {
            env.log.error("Items must be a JSON array");
            return {
                type: "fail",
                error: "Items must be a JSON array",
            };
        }

        if (!itemVariable || itemVariable.trim().length === 0) {
            env.log.error("Item Variable is required");
            return {
                type: "fail",
                error: "Item Variable name is required",
            };
        }

        env.log.info(`FOREACH will iterate over ${items.length} items`);

        // Store metadata for scheduler
        env.setOutput("_items", JSON.stringify(items));
        env.setOutput("_itemVariable", itemVariable);
        env.setOutput("results", JSON.stringify([])); // Will be populated by scheduler
        env.setOutput("count", items.length.toString());

        return {
            type: "success",
            outputs: {
                _items: JSON.stringify(items),
                _itemVariable: itemVariable,
                results: JSON.stringify([]),
                count: items.length.toString(),
            },
        };
    } catch (error: any) {
        env.log.error(`FOREACH setup error: ${error.message}`);
        return {
            type: "fail",
            error: error.message,
        };
    }
};
