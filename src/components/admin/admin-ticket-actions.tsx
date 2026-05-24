"use client";

import { Button } from "@/components/ui/button";
import type { TicketStatus } from "@/types/database";

export function AdminTicketActions({
  ticketId,
  status,
}: {
  ticketId: string;
  status: TicketStatus;
}) {
  async function updateStatus(newStatus: TicketStatus) {
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status: newStatus }),
    });
    window.location.reload();
  }

  if (status === "resolved") return null;

  return (
    <div className="flex gap-1">
      {status === "open" && (
        <Button size="sm" variant="secondary" onClick={() => updateStatus("pending")}>
          Pending
        </Button>
      )}
      <Button size="sm" onClick={() => updateStatus("resolved")}>
        Resolve
      </Button>
    </div>
  );
}
