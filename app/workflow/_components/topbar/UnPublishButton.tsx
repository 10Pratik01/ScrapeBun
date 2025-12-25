"use client";
import { unPublishWorkflow } from "@/actions/workflows";
import { Button } from "@/components/ui/button";

import { DownloadIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function UnPublishButton({ workflowId }: { workflowId: string }) {
  const [isPending, startTransition] = React.useTransition();


  return (
    <Button
      variant={"outline"}
      size="sm"
      className="flex items-center gap-1.5 text-xs"
      disabled={isPending}
      onClick={() => {
        if (
          window.confirm("Are you sure you want to deactivate this workflow?")
        ) {
          toast.loading("Deactivating workflow...", { id: workflowId });
          startTransition(async () => {
            try {
              await unPublishWorkflow(workflowId);
              toast.success("Workflow deactivated", { id: workflowId });
              setTimeout(() => window.location.reload(), 500);
            } catch (error) {
              toast.error("Something went wrong", { id: workflowId });
            }
          });
        }
      }}
    >
      <DownloadIcon size={14} />
      Deactivate
    </Button>
  );
}

export default UnPublishButton;
