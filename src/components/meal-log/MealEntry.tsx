"use client";

import { useState } from "react";
import { MealLogDTO, MEAL_CATEGORIES } from "@/types";

interface Props {
  meal: MealLogDTO;
  readOnly: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (meal: MealLogDTO) => void;
}

export default function MealEntry({ meal, readOnly, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(meal.category);
  const [notes, setNotes] = useState(meal.notes ?? "");
  const [saving, setSaving] = useState(false);

  const catMeta = MEAL_CATEGORIES.find((c) => c.value === meal.category);

  async function handleSave(cat: string, currentNotes: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/meal-log/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, notes: currentNotes || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate?.({ ...meal, category: updated.category, notes: updated.notes });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/meal-log/${meal.id}`, { method: "DELETE" });
    if (res.ok) onDelete?.(meal.id);
  }

  if (editing) {
    return (
      <li className="bg-gray-50 rounded-lg p-2 space-y-2">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
          placeholder="Notes (optional)"
        />
        <div className="flex flex-wrap gap-1">
          {MEAL_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              disabled={saving}
              onClick={() => { setCategory(c.value); handleSave(c.value, notes); }}
              className={`text-xs px-2 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                category === c.value
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-medium"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {saving && category === c.value ? "…" : `${c.emoji} ${c.label}`}
            </button>
          ))}
        </div>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-1 group text-sm">
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 text-xs leading-snug">
          {catMeta ? `${catMeta.emoji} ${catMeta.label}` : meal.category}
        </p>
        {meal.notes && <p className="text-xs text-gray-400 truncate">{meal.notes}</p>}
      </div>
      {!readOnly && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-indigo-500 text-xs">✏️</button>
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-400 text-xs">✕</button>
        </div>
      )}
    </li>
  );
}
