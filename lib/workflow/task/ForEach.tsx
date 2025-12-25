import { TaskParamType, TaskType, WorkflowTask } from "@/lib/types";
import { Repeat } from "lucide-react";

export const ForEachTask: WorkflowTask & { type: TaskType.FOREACH } = {
    type: TaskType.FOREACH,
    label: "For Each",
    icon: Repeat,
    isEntryPoint: false,
    inputs: [
        {
            name: "Items",
            type: TaskParamType.STRING,
            helperText: "JSON array to iterate over (e.g., [\"item1\", \"item2\"] or {NODE_ID.array})",
            required: true,
        },
        {
            name: "Item Variable",
            type: TaskParamType.STRING,
            helperText: "Variable name for current item (e.g., 'currentUrl')",
            required: true,
        },
    ],
    outputs: [
        {
            name: "results",
            type: TaskParamType.STRING,
            helperText: "Aggregated results from all iterations (JSON array)",
        },
        {
            name: "count",
            type: TaskParamType.STRING,
            helperText: "Total number of iterations completed",
        },
    ],
    credits: 0, // Credits charged per iteration, not for the FOREACH node itself
};
