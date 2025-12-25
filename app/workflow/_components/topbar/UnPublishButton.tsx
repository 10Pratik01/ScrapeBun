"use client";
import { unPublishWorkflow } from "@/actions/workflows";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { DownloadIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function UnPublishButton({ workflowId }: { workflowId: string }) {
  const mutation = useMutation({
    mutationFn: unPublishWorkflow,
    onSuccess: () => {
      toast.success("Workflow deactivated", { id: workflowId });
      // Force full page reload to update workflow status
      setTimeout(() => window.location.reload(), 500);
    },
    onError: (error) => {
      toast.error("Something went wrong", { id: workflowId });
    },
  });


  return (
    <Button
      variant={"outline"}
      size="sm"
      className="flex items-center gap-1.5 text-xs"
      disabled={mutation.isPending}
      onClick={() => {
        if (window.confirm("Are you sure you want to deactivate this workflow?")) {
          toast.loading("Deactivating workflow...", { id: workflowId });
          mutation.mutate(workflowId);
        }
      }}
    >
      <DownloadIcon size={14} />
      Deactivate
    </Button>
  );
}

export default UnPublishButton;
