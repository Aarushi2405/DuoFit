"use client";

import { useState, FormEvent } from "react";
import { ChecklistItemDTO } from "@/types";
import { Button } from "@/components/ui/Button";

interface Props {
  weekStart: string;
  onAdd: (item: ChecklistItemDTO) => void;
}

function toDateInput(iso: string): string {
  return iso.split("T")[0];
}

export default function AddItemForm({ weekStart, onAdd }: Props) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekStart);
  weekEndDate.setUTCDate(weekStartDate.getUTCDate() + 6);
  const todayStr = toDateInput(new Date().toISOString());
  const defaultDate = todayStr >= toDateInput(weekStart) && todayStr <= toDateInput(weekEndDate.toISOString())
    ? todayStr
    : toDateInput(weekStart);

  const [logDate, setLogDate] = useState(defaultDate);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, weekStart, logDate }),
      });
      if (res.ok) {
        const item = await res.json();
        onAdd({
          id: item.id,
          label: item.label,
          done: item.done,
          weekStart: item.weekStart,
          userId: item.userId,
          createdAt: item.createdAt,
        });
        setLabel("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a task..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 min-w-0 text-sm border border-input bg-background rounded-lg px-3 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
        />
        <Button
          type="submit"
          variant="brand"
          size="sm"
          disabled={loading || !label.trim()}
          className="shrink-0"
        >
          {loading ? "..." : "+"}
        </Button>
      </div>
      <input
        type="date"
        value={logDate}
        min={toDateInput(weekStart)}
        max={toDateInput(weekEndDate.toISOString())}
        onChange={(e) => setLogDate(e.target.value)}
        className="w-full text-xs border border-input bg-background rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 text-muted-foreground"
      />
    </form>
  );
}