"use client";

import { useState, FormEvent } from "react";
import { MealLogDTO, MEAL_TYPES, MEAL_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/Button";

interface Props {
  date: string;
  onAdd: (meal: MealLogDTO) => void;
  onCancel: () => void;
}

export default function AddMealForm({ date, onAdd, onCancel }: Props) {
  const [mealType, setMealType] = useState<string>("breakfast");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealType, category, notes: notes || null, logDate: date }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to log meal");
        return;
      }
      const meal = await res.json();
      onAdd({
        id: meal.id,
        mealType: meal.mealType,
        category: meal.category,
        notes: meal.notes,
        calories: meal.calories,
        logDate: meal.logDate,
        userId: meal.userId,
        createdAt: meal.createdAt,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 bg-muted/50 rounded-lg p-2.5">
      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        className="w-full text-xs border border-input bg-background rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      >
        {MEAL_TYPES.map((t) => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full text-xs border border-input bg-background rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        required
      >
        <option value="">Select type...</option>
        {MEAL_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full text-xs border border-input bg-background rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="brand"
          size="sm"
          disabled={loading || !category}
          className="flex-1"
        >
          {loading ? "Saving..." : "Log meal"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}