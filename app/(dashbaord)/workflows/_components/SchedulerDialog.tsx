"use client";

import {
  removeWorkflowSchedule,
  updateWorkFlowCron,
} from "@/actions/workflows";
import CustomDialogHeader from "@/components/CustomDialogHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

import { CalendarIcon, ClockIcon, TriangleAlertIcon, InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import cronstrue from "cronstrue";
import parser from "cron-parser";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Quick select presets for common schedules
const CRON_PRESETS = [
  { label: "Every Hour", value: "0 * * * *", description: "At minute 0 of every hour" },
  { label: "Daily 9 AM", value: "0 9 * * *", description: "Every day at 9:00 AM UTC" },
  { label: "Weekly Mon 9 AM", value: "0 9 * * 1", description: "Every Monday at 9:00 AM UTC" },
  { label: "Every 30 min", value: "*/30 * * * *", description: "Every 30 minutes" },
];

function SchedulerDialog({
  workflowId,
  workflowCron,
}: {
  workflowId: string;
  workflowCron: string | null;
}) {
  const [cron, setCron] = useState(workflowCron || "");
  const [validCron, setValidCron] = useState(false);
  const [readableCron, setReadableCron] = useState("");

  const mutation = useMutation({
    mutationFn: updateWorkFlowCron,
    onSuccess: () => {
      toast.success("Schedule updated successfully", { id: "cron" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong", { id: "cron" });
    },
  });

  const removeScheduleMutation = useMutation({
    mutationFn: removeWorkflowSchedule,
    onSuccess: () => {
      toast.success("Schedule removed successfully", { id: "cron" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong", { id: "cron" });
    },
  });

  useEffect(() => {
    try {
      const cronString = cronstrue.toString(cron);
      parser.parseExpression(cron);
      setValidCron(true);
      setReadableCron(cronString);
    } catch (error: any) {
      console.log(error.message);
      setValidCron(false);
    }
  }, [cron]);

  const hasValidCron = workflowCron && workflowCron.length > 0;
  const readableWorkflowCron = hasValidCron && cronstrue.toString(workflowCron);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"link"}
          size={"sm"}
          className={cn(
            "text-sm p-0 h-auto text-orange-400",
            hasValidCron && "text-primary"
          )}
        >
          {hasValidCron ? (
            <div className="flex items-center gap-2">
              <ClockIcon />
              {readableWorkflowCron}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <TriangleAlertIcon className="h-3 w-3 mr-1" />
              Set Schedule
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 max-w-2xl">
        <CustomDialogHeader
          title="Schedule workflow execution"
          icon={CalendarIcon}
        />

        {/* Info banner explaining external cron service */}
        <div className="px-6">
          <Alert className="border-blue-500/50 bg-blue-500/5">
            <InfoIcon className="h-4 w-4 stroke-blue-500" />
            <AlertDescription className="text-sm">
              <strong>How Scheduling Works:</strong> Your workflow runs automatically via an external cron service (e.g., <a href="https://cron-job.org" target="_blank" className="underline hover:text-blue-600">cron-job.org</a>).
              Set up the service to call: <code className="text-xs bg-muted px-1 py-0.5 rounded">https://yoursite.com/api/workflows/cron</code>
              <br /><strong>Works even when your browser is closed!</strong> ✨
            </AlertDescription>
          </Alert>
        </div>

        <div className="px-6 space-y-4">
          <div>
            <p className="text-muted-foreground text-sm mb-2">
              Specify a cron expression to schedule periodic workflow execution.
              All times are in UTC.
            </p>

            {/* Quick select buttons */}
            <div className="mb-3">
              <p className="text-xs font-medium mb-2">Quick Select:</p>
              <div className="flex flex-wrap gap-2">
                {CRON_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setCron(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Input
            placeholder="e.g., 0 9 * * * (daily at 9 AM) or */30 * * * * (every 30 min)"
            value={cron}
            onChange={(e) => setCron(e.target.value)}
          />
          {cron && (
            <div
              className={cn(
                "bg-accent rounded-md p-4 border text-sm text-destructive border-destructive",
                validCron && "text-primary border-primary"
              )}
            >
              {validCron ? readableCron : "Not a valid cron expression"}
            </div>
          )}
        </div>
        {validCron && (
          <DialogClose asChild>
            <div className="px-8">
              <Button
                className="w-full text-destructive border-destructive hover:text-destructive"
                variant={"outline"}
                disabled={
                  mutation.isPending || removeScheduleMutation.isPending
                }
                onClick={() => {
                  toast.loading("Removing schedule", { id: "cron" });
                  removeScheduleMutation.mutate(workflowId);
                }}
              >
                Remove current schedule
              </Button>
              <Separator className="my-4" />
            </div>
          </DialogClose>
        )}
        <DialogFooter className="px-6 gap-2">
          <DialogClose asChild>
            <Button className="w-full" variant={"secondary"}>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="w-full"
              disabled={!validCron || mutation.isPending || !cron}
              onClick={() => {
                toast.loading("Saving schedule", { id: "cron" });
                mutation.mutate({
                  cron,
                  id: workflowId,
                });
              }}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SchedulerDialog;
