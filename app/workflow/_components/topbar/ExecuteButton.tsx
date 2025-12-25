"use client";
import { runWorkflow } from "@/actions/runWorkflow";
import { Button } from "@/components/ui/button";
import useExecutionPlan from "@/hooks/useExecutionPlan";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { CoinsIcon, PlayIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function ExecuteButton({
  workflowId,
  isPublished = false,
  creditsCost = 0,
}: {
  workflowId: string;
  isPublished?: boolean;
  creditsCost?: number;
}) {
  const generateExecutionPlan = useExecutionPlan();
  const { toObject } = useReactFlow();

  const executeMutation = useMutation({
    mutationFn: runWorkflow,
    onSuccess: () => {
      toast.success("Execution Started", { id: "flow-execution" });
    },
    onError: () => {
      toast.error("Something went wrong", { id: "flow-execution" });
    },
  });

  const handleExecute = () => {
    const plan = generateExecutionPlan();
    if (!plan) return;

    const flowDefinition = JSON.stringify(toObject());
    toast.loading("Starting execution...", { id: "flow-execution" });
    executeMutation.mutate({
      workflowId,
      flowDefinition,
    });
  };

  return (
    <Button
      variant={"outline"}
      className="flex items-center gap-2"
      disabled={executeMutation.isPending}
      onClick={handleExecute}
    >
      <PlayIcon size={16} className="stroke-orange-400" />
      Execute
      {creditsCost > 0 && (
        <span className="flex items-center gap-1 ml-1 text-xs text-muted-foreground">
          <CoinsIcon size={12} />
          {creditsCost}
        </span>
      )}
    </Button>
  );
}

export default ExecuteButton;
