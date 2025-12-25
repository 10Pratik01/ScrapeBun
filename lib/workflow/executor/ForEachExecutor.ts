import { ExecutionEnviornment, WorkflowTask } from "@/lib/types";

/**
 * FOREACH node executor
 * Note: The actual iteration spawning is handled by the scheduler
 * This executor just validates the input and prepares for iteration
 */
export const ForEachExecutor = async (
    enviornment: ExecutionEnviornment<WorkflowTask & { type: "FOREACH" }>
): Promise<boolean> => {
    const itemsInput = enviornment.getInput("Items");
    const itemVariable = enviornment.getInput("Item Variable");

    enviornment.log.info(`Starting FOREACH loop with variable: ${itemVariable}`);

    try {
        // Parse the items array
        let items: any[];
        try {
            items = JSON.parse(itemsInput);
        } catch (e) {
            enviornment.log.error(`Failed to parse items as JSON: ${itemsInput}`);
            return false;
        }

        if (!Array.isArray(items)) {
            enviornment.log.error("Items must be a JSON array");
            return false;
        }

        if (!itemVariable || itemVariable.trim().length === 0) {
            enviornment.log.error("Item Variable is required");
            return false;
        }

        enviornment.log.info(`FOREACH will iterate over ${items.length} items`);

        // Store the items for the scheduler to use
        enviornment.setOutput("results", JSON.stringify([])); // Will be populated by scheduler
        enviornment.setOutput("count", items.length.toString());

        // The actual iteration is handled by the scheduler
        // This executor just validates and signals readiness
        return true;
    } catch (error) {
        enviornment.log.error(`FOREACH setup error: ${error}`);
        return false;
    }
};
