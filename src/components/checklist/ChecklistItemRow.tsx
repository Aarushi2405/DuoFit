"use client";

import { useState, useRef } from "react";
import { ChecklistItemDTO } from "@/types";

interface Props {
  item: ChecklistItemDTO;
  readOnly: boolean;
  accent: "indigo" | "amber";
  onToggle?: (id: string, done: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (item: ChecklistItemDTO) => void;
}

export default function ChecklistItemRow({ item, readOnly, accent, onToggle, onDelete, onUpdate }: Props) {
  const [localDone, setLocalDone] = useState(item.done);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(item.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkClass = accent === "indigo"
    ? "text-indigo-600 border-indigo-400"
    : "text-amber-600 border-amber-400";

  async function handleToggle() {
    const next = !localDone;
    setLocalDone(next);
    try {
      const res = await fetch(`/api/checklist/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) setLocalDone(localDone);
      else onToggle?.(item.id, next);
    } catch {
      setLocalDone(localDone);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/checklist/${item.id}`, { method: "DELETE" });
      if (res.ok) onDelete?.(item.id);
    } finally {
      setDeleting(false);
    }
  }

  function startEdit() {
    setEditLabel(item.label);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function commitEdit() {
    const trimmed = editLabel.trim();
    if (!trimmed || trimmed === item.label) {
      setEditing(false);
      setEditLabel(item.label);
      return;
    }
    const res = await fetch(`/api/checklist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: trimmed }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate?.({ ...item, label: updated.label });
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setEditing(false);
      setEditLabel(item.label);
    }
  }

  return (
    <li className="flex items-center gap-2 group">
      <button
        onClick={readOnly ? undefined : handleToggle}
        disabled={readOnly}
        className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
          readOnly ? "opacity-60 cursor-default" : "cursor-pointer"
        } ${localDone ? checkClass + " bg-current" : "border-gray-300"}`}
        aria-label={localDone ? "Mark incomplete" : "Mark complete"}
      >
        {localDone && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm border-b border-indigo-400 outline-none bg-transparent py-0.5"
          autoFocus
        />
      ) : (
        <span className={`flex-1 text-sm ${localDone ? "line-through text-gray-400" : "text-gray-700"}`}>
          {item.label}
        </span>
      )}

      {!readOnly && !editing && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={startEdit}
            className="text-gray-300 hover:text-indigo-400 text-xs"
            aria-label="Edit label"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-300 hover:text-red-400 text-xs disabled:opacity-50"
            aria-label="Delete item"
          >
            ✕
          </button>
        </div>
      )}
    </li>
  );
}
