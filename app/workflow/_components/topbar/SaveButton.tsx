"use client";

import { updateWorkFlow } from "@/actions/workflows";
import { Button } from "@/components/ui/button";

import { useReactFlow } from "@xyflow/react";
import { CheckIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function SaveButton({ workflowId }: { workflowId: string }) {
  const { toObject } = useReactFlow();
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      variant={"outline"}
      className="flex items-center gap-2"
      onClick={() => {
        const workflowDef = JSON.stringify(toObject());
        toast.loading("Saving Workflow", { id: "save-workflow" });
        startTransition(async () => {
          try {
            await updateWorkFlow({
              id: workflowId,
              definition: workflowDef,
            });
            toast.success("Flow saved successfully", { id: "save-workflow" });
          } catch (error) {
            toast.error("Somwthing went wrong", { id: "save-workflow" });
          }
        });
      }}
      disabled={isPending}
    >
      <CheckIcon size={16} className="stroke-purple-400" />
      Save
    </Button>
  );
}

export default SaveButton;
