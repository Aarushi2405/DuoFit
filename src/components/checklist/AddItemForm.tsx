"use client";

import { useState, FormEvent } from "react";
import { ChecklistItemDTO } from "@/types";

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

  // Default logDate to today, clamped within the week
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
    <form onSubmit={handleSubmit} className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        <input
          type="text"
          placeholder="Add task…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
        />
        <button
          type="submit"
          disabled={loading || !label.trim()}
          className="text-indigo-600 hover:text-indigo-700 disabled:opacity-40 text-lg font-bold leading-none px-1"
          aria-label="Add"
        >
          +
        </button>
      </div>
      <input
        type="date"
        value={logDate}
        min={toDateInput(weekStart)}
        max={toDateInput(weekEndDate.toISOString())}
        onChange={(e) => setLogDate(e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-400 text-gray-500"
      />
    </form>
  );
}
