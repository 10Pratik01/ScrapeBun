"use client";
import TooltipWrapper from "@/components/TooltipWrapper";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Fragment } from "react";
import SaveButton from "./SaveButton";
import ExecuteButton from "./ExecuteButton";
import NavigationTabs from "./NavigationTabs";
import PublishButton from "./PublishButton";
import UnPublishButton from "./UnPublishButton";
import OptimizationButton from "./OptimizationButton";

interface Props {
  title: string;
  subtitle?: string;
  workflowId: string;
  hideButtons?: boolean;
  isPublished?: boolean;
  creditsCost?: number;
}

function Topbar({
  title,
  subtitle,
  workflowId,
  hideButtons = false,
  isPublished = false,
  creditsCost = 0,
}: Props) {
  const router = useRouter();

  return (
    <header className="flex p-2 border-b-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10">
      <div className="flex gap-1 flex-1">
        <TooltipWrapper content="Black">
          <Button variant={"ghost"} size={"icon"} onClick={() => router.back()}>
            <ChevronLeftIcon size={30} />
          </Button>
        </TooltipWrapper>
        <div className="">
          <p className="font-bold text-ellipsis truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate text-ellipsis">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <NavigationTabs workflowId={workflowId} />
      <div className="flex gap-1 flex-1 justify-end">
        {!hideButtons && (
          <Fragment>
            <OptimizationButton />
            {!isPublished && <PublishButton workflowId={workflowId} />}
            <ExecuteButton workflowId={workflowId} isPublished={isPublished} creditsCost={creditsCost} />
            <SaveButton workflowId={workflowId} />
            {isPublished && <UnPublishButton workflowId={workflowId} />}
          </Fragment>
        )}
      </div>
    </header>
  );
}

export default Topbar;
