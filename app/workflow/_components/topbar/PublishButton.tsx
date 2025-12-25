"use client";
import { updateWorkFlow, publishWorkflow } from "@/actions/workflows";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useExecutionPlan from "@/hooks/useExecutionPlan";

import { useReactFlow } from "@xyflow/react";
import { RocketIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function PublishButton({ workflowId }: { workflowId: string }) {
  const generateExecutionPlan = useExecutionPlan();
  const { toObject } = useReactFlow();
  const [isPending, startTransition] = React.useTransition();

  const handlePublish = async () => {
    const plan = generateExecutionPlan();
    if (!plan) return;

    const flowDefinition = JSON.stringify(toObject());

    toast.loading("Saving and activating workflow...", { id: workflowId });

    startTransition(async () => {
      try {
        // Save first, then publish
        await updateWorkFlow({
          id: workflowId,
          definition: flowDefinition,
        });

        // Then publish (activate)
        await publishWorkflow({
          id: workflowId,
          flowDefinition,
        });
        toast.success("Workflow activated successfully!", { id: workflowId });
        setTimeout(() => window.location.reload(), 500);
      } catch (error: any) {
        toast.error(error.message || "Failed to activate workflow", {
          id: workflowId,
        });
      }
    });
  };

  return (
    <Button
      variant={"outline"}
      size="sm"
      className="flex items-center gap-1.5 text-xs"
      disabled={isPending}
      onClick={handlePublish}
    >
      <RocketIcon size={14} />
      Activate
    </Button>
  );
}

export default PublishButton;
