"use client";

import { runWorkflow } from "@/actions/runWorkflow";
import { Button } from "@/components/ui/button";

import { PlayIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import React from "react";

function RunButton({ workflowId }: { workflowId: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      variant={"outline"}
      size={"sm"}
      className={cn(
        "flex items-center gap-2",
        isPending && "opacity-50 cursor-not-allowed"
      )}
      disabled={isPending}
      onClick={() => {
        toast.loading("Scheduling run...", { id: workflowId });
        startTransition(async () => {
          try {
            await runWorkflow({ workflowId });
            toast.success("Workflow started", { id: workflowId });
          } catch (error: any) {
            toast.error(error.message || "Something went wrong", {
              id: workflowId,
            });
          }
        });
      }}
    >
      <PlayIcon size={16} />
      Run
    </Button>
  );
}

export default RunButton;
