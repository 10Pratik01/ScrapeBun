"use client";
import { updateWorkFlow, publishWorkflow } from "@/actions/workflows";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useExecutionPlan from "@/hooks/useExecutionPlan";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { RocketIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function PublishButton({ workflowId }: { workflowId: string }) {
  const generateExecutionPlan = useExecutionPlan();
  const { toObject } = useReactFlow();

  const saveMutation = useMutation({
    mutationFn: updateWorkFlow,
  });

  const publishMutation = useMutation({
    mutationFn: publishWorkflow,
    onSuccess: () => {
      toast.success("Workflow activated successfully!", { id: workflowId });
      // Force full page reload to update workflow status
      setTimeout(() => window.location.reload(), 500);
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong", { id: workflowId });
    },
  });

  const handlePublish = async () => {
    const plan = generateExecutionPlan();
    if (!plan) return;

    const flowDefinition = JSON.stringify(toObject());

    try {
      toast.loading("Saving and activating workflow...", { id: workflowId });

      // Save first, then publish
      await saveMutation.mutateAsync({
        id: workflowId,
        definition: flowDefinition,
      });

      // Then publish (activate)
      await publishMutation.mutateAsync({
        id: workflowId,
        flowDefinition,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to activate workflow", {
        id: workflowId,
      });
    }
  };

  return (
    <Button
      variant={"outline"}
      size="sm"
      className="flex items-center gap-1.5 text-xs"
      disabled={publishMutation.isPending || saveMutation.isPending}
      onClick={handlePublish}
    >
      <RocketIcon size={14} />
      Activate
    </Button>
  );
}

export default PublishButton;
