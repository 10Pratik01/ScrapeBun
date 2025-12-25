import { ExecutionEnviornment, WorkflowTask, ConditionOperator } from "@/lib/types";

/**
 * CONDITION node executor
 * Evaluates a condition and returns boolean result
 */
export const ConditionExecutor = async (
    enviornment: ExecutionEnviornment<WorkflowTask & { type: "CONDITION" }>
): Promise<boolean> => {
    const leftValue = enviornment.getInput("Left Value");
    const operator = enviornment.getInput("Operator") as ConditionOperator;
    const rightValue = enviornment.getInput("Right Value") || "";

    enviornment.log.info(
        `Evaluating condition: "${leftValue}" ${operator} "${rightValue}"`
    );

    let result: boolean = false;

    try {
        switch (operator) {
            case ConditionOperator.EQUALS:
                result = leftValue === rightValue;
                break;

            case ConditionOperator.NOT_EQUALS:
                result = leftValue !== rightValue;
                break;

            case ConditionOperator.CONTAINS:
                result = leftValue.includes(rightValue);
                break;

            case ConditionOperator.NOT_CONTAINS:
                result = !leftValue.includes(rightValue);
                break;

            case ConditionOperator.STARTS_WITH:
                result = leftValue.startsWith(rightValue);
                break;

            case ConditionOperator.ENDS_WITH:
                result = leftValue.endsWith(rightValue);
                break;

            case ConditionOperator.IS_EMPTY:
                result = leftValue.trim().length === 0;
                break;

            case ConditionOperator.IS_NOT_EMPTY:
                result = leftValue.trim().length > 0;
                break;

            case ConditionOperator.GREATER_THAN:
                result = parseFloat(leftValue) > parseFloat(rightValue);
                break;

            case ConditionOperator.LESS_THAN:
                result = parseFloat(leftValue) < parseFloat(rightValue);
                break;

            case ConditionOperator.GREATER_OR_EQUAL:
                result = parseFloat(leftValue) >= parseFloat(rightValue);
                break;

            case ConditionOperator.LESS_OR_EQUAL:
                result = parseFloat(leftValue) <= parseFloat(rightValue);
                break;

            default:
                enviornment.log.error(`Unknown operator: ${operator}`);
                return false;
        }

        enviornment.log.info(`Condition result: ${result}`);
        enviornment.setOutput("result", result.toString());
        return true;
    } catch (error) {
        enviornment.log.error(`Condition evaluation error: ${error}`);
        return false;
    }
};
