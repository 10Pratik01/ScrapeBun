import { TaskParamType, TaskType, WorkflowTask, ConditionOperator } from "@/lib/types";
import { GitBranch } from "lucide-react";

export const ConditionTask: WorkflowTask & { type: TaskType.CONDITION } = {
    type: TaskType.CONDITION,
    label: "Condition",
    icon: GitBranch,
    isEntryPoint: false,
    inputs: [
        {
            name: "Left Value",
            type: TaskParamType.STRING,
            helperText: "First value to compare (can use parameters like {NODE_ID.output})",
            required: true,
        },
        {
            name: "Operator",
            type: TaskParamType.SELECT,
            helperText: "Comparison operator",
            required: true,
            options: [
                { label: "Equals", value: ConditionOperator.EQUALS },
                { label: "Not Equals", value: ConditionOperator.NOT_EQUALS },
                { label: "Contains", value: ConditionOperator.CONTAINS },
                { label: "Not Contains", value: ConditionOperator.NOT_CONTAINS },
                { label: "Starts With", value: ConditionOperator.STARTS_WITH },
                { label: "Ends With", value: ConditionOperator.ENDS_WITH },
                { label: "Is Empty", value: ConditionOperator.IS_EMPTY },
                { label: "Is Not Empty", value: ConditionOperator.IS_NOT_EMPTY },
                { label: "Greater Than", value: ConditionOperator.GREATER_THAN },
                { label: "Less Than", value: ConditionOperator.LESS_THAN },
                { label: "Greater or Equal", value: ConditionOperator.GREATER_OR_EQUAL },
                { label: "Less or Equal", value: ConditionOperator.LESS_OR_EQUAL },
            ],
        },
        {
            name: "Right Value",
            type: TaskParamType.STRING,
            helperText: "Second value to compare (can use parameters)",
            required: false,
        },
    ],
    outputs: [
        {
            name: "result",
            type: TaskParamType.STRING,
            helperText: "Boolean result: 'true' or 'false'",
        },
    ],
    credits: 0, // No credits for logic operations
};
