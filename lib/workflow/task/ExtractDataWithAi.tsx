import { TaskParamType, TaskType, WorkflowTask } from "@/lib/types";
import { BrainIcon, LucideProps } from "lucide-react";

export const ExtractDataWithAiTask = {
  type: TaskType.EXTRACT_DATA_WITH_AI,
  label: "Extract data with AI",
  icon: (props: LucideProps) => (
    <BrainIcon className="stroke-rose-400" {...props} />
  ),
  isEntryPoint: false,
  credits: 3,
  inputs: [
    {
      name: "Content",
      type: TaskParamType.STRING,
      required: true,
    },
    {
      name: "Provider",
      type: TaskParamType.SELECT,
      required: true,
      defaultValue: "openai",
      options: [
        { label: "OpenAI", value: "openai" },
        { label: "Google Gemini", value: "google" },
      ],
    },
    {
      name: "Model",
      type: TaskParamType.SELECT,
      required: true,
      defaultValue: "gpt-4o-mini",
      options: [
        { label: "GPT-4o", value: "gpt-4o" },
        { label: "GPT-4o Mini", value: "gpt-4o-mini" },
        { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
        { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
        { label: "Gemini 1.5 Flash 8B", value: "gemini-1.5-flash-8b" },
        { label: "Gemini 2.0 Flash Exp", value: "gemini-2.0-flash-exp" },
      ],
    },
    {
      name: "Credentials",
      type: TaskParamType.CREDENTIAL,
      required: true,
    },
    {
      name: "Prompt",
      type: TaskParamType.STRING,
      required: true,
      variant: "textarea",
    },
  ] as const,
  outputs: [
    {
      name: "Extracted Data",
      type: TaskParamType.STRING,
    },
  ] as const,
} satisfies WorkflowTask;
