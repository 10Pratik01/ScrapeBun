import { TaskParamType, TaskType, WorkflowTask } from "@/lib/types";
import { GitMergeIcon, LucideProps } from "lucide-react";

export const MergeTask = {
    type: TaskType.MERGE,
    label: "Merge Inputs",
    icon: (props: LucideProps) => (
        <GitMergeIcon className="stroke-purple-400" {...props} />
    ),
    isEntryPoint: false,
    inputs: [
        { name: "Input 1", type: TaskParamType.STRING, required: false },
        { name: "Input 2", type: TaskParamType.STRING, required: false },
        { name: "Input 3", type: TaskParamType.STRING, required: false },
        {
            name: "Merge Strategy",
            type: TaskParamType.SELECT,
            required: true,
            options: [
                { label: "Object (default)", value: "object" },
                { label: "Array", value: "array" },
            ],
            helperText: "Combine up to 10 inputs as object or array",
        },
    ] as const,
    outputs: [
        {
            name: "Merged Output",
            type: TaskParamType.STRING,
        },
    ] as const,
    credits: 0,
} satisfies WorkflowTask;

