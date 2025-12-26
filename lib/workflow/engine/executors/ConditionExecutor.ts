import { StepExecutor, StepResult, ExecutionEnv } from "../types";
import { ConditionOperator } from "@/lib/types";

/**
 * CONDITION node executor for Engine V2
 * Evaluates a condition and returns boolean result
 */
export const ConditionExecutorV2: StepExecutor = async (
    env: ExecutionEnv
): Promise<StepResult> => {
    const leftValue = env.getInput("Left Value") || "";
    const operator = env.getInput("Operator") as ConditionOperator;
    
    const rightValue = env.getInput("Right Value") || "";

    env.log.info(
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
                env.log.error(`Unknown operator: ${operator}`);
                return { type: "fail", error: `Unknown operator: ${operator}` };
        }

        env.log.info(`Condition result: ${result}`);
        env.setOutput("result", result.toString());

        return {
            type: "success",
            outputs: { result: result.toString() },
        };
    } catch (error: any) {
        env.log.error(`Condition evaluation error: ${error.message}`);
        return { type: "fail", error: error.message };
    }
};
