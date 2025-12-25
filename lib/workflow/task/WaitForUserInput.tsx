import { TaskParamType, TaskType, WorkflowTask } from "@/lib/types";
import { ShieldAlert } from "lucide-react";

export const WaitForUserInputTask: WorkflowTask & { type: TaskType.WAIT_FOR_USER_INPUT } = {
    type: TaskType.WAIT_FOR_USER_INPUT,
    label: "Wait for User Input",
    icon: ShieldAlert,
    isEntryPoint: false,
    inputs: [
        {
            name: "Message",
            type: TaskParamType.STRING,
            helperText: "Message to display to user (e.g., 'Please solve the CAPTCHA')",
            required: true,
        },
        {
            name: "Timeout Minutes",
            type: TaskParamType.STRING,
            helperText: "How long to wait for user input (in minutes). Default: 10",
            required: false,
        },
    ],
    outputs: [
        {
            name: "completed",
            type: TaskParamType.STRING,
            helperText: "Always 'true' when user resumes",
        },
        {
            name: "resumedAt",
            type: TaskParamType.STRING,
            helperText: "Timestamp when user resumed execution",
        },
    ],
    credits: 0, // No credits for pausing
};
