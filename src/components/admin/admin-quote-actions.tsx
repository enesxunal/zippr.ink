"use client";

import { Button } from "@/components/ui/button";
import type { QuoteStatus } from "@/types/database";

export function AdminQuoteActions({
  quoteId,
  status,
}: {
  quoteId: string;
  status: QuoteStatus;
}) {
  async function updateStatus(newStatus: QuoteStatus) {
    await fetch("/api/admin/quotes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId, status: newStatus }),
    });
    window.location.reload();
  }

  return (
    <div className="flex gap-1">
      {status === "pending" && (
        <Button size="sm" variant="secondary" onClick={() => updateStatus("contacted")}>
          Contact
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => updateStatus("closed")}>
        Close
      </Button>
    </div>
  );
}
