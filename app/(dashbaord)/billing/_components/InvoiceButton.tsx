"use client";
import { downloadInvoice } from "@/actions/billings";
import { Button } from "@/components/ui/button";

import { Loader2Icon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function InvoiceButton({ id }: { id: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      className="text-xs gap-2 text-muted-foreground px-1"
      variant={"ghost"}
      size={"sm"}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const data = await downloadInvoice(id);
            window.open(data as string, "_blank");
          } catch (error: any) {
            toast.success(error.message || "Something went wrong", {
              id: "invoice",
            });
          }
        });
      }}
    >
      Invoice
      {isPending && <Loader2Icon className="h-4 w-4 animate-spin" />}
    </Button>
  );
}

export default InvoiceButton;
