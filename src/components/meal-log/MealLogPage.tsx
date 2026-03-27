"use client";

import { useState, useCallback } from "react";
import { MealLogDTO } from "@/types";
import { MealLog } from "@/generated/prisma";
import MealColumn from "@/components/meal-log/MealColumn";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  initialMine: MealLog[];
  initialPartner: MealLog[];
  partnerName: string | null;
  today: string;
}

function toDTO(m: MealLog): MealLogDTO {
  return {
    id: m.id,
    mealType: m.mealType,
    category: m.category,
    notes: m.notes,
    calories: m.calories,
    logDate: m.logDate.toISOString(),
    userId: m.userId,
    createdAt: m.createdAt.toISOString(),
  };
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function MealLogPage({ initialMine, initialPartner, partnerName, today }: Props) {
  const [date, setDate] = useState(today);
  const [mine, setMine] = useState<MealLogDTO[]>(initialMine.map(toDTO));
  const [partner, setPartner] = useState<MealLogDTO[]>(initialPartner.map(toDTO));
  const [loading, setLoading] = useState(false);

  async function fetchDay(d: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/meal-log?date=${d}`);
      if (res.ok) {
        const data = await res.json();
        setMine(data.mine);
        setPartner(data.partner);
      }
    } finally {
      setLoading(false);
    }
  }

  function navigate(direction: -1 | 1) {
    const d = new Date(date + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + direction);
    const next = d.toISOString().split("T")[0];
    setDate(next);
    fetchDay(next);
  }

  const handleAdd = useCallback((meal: MealLogDTO) => {
    setMine((prev) => [...prev, meal]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setMine((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleUpdate = useCallback((updated: MealLogDTO) => {
    setMine((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  const isToday = date === today;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Meals</h1>

        <div className="flex items-center justify-between mb-4 bg-muted/50 rounded-xl p-1">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-foreground">{formatDateLabel(date)}</span>
          <button
            onClick={() => navigate(1)}
            disabled={isToday}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MealColumn
              title="You"
              meals={mine}
              readOnly={false}
              accent="brand"
              date={date}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
            <MealColumn
              title={partnerName ?? "Partner"}
              meals={partner}
              readOnly
              accent="partner"
              date={date}
            />
          </div>
        )}
      </div>
    </div>
  );
}