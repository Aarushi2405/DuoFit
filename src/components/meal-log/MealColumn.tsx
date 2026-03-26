"use client";

import { useState } from "react";
import { MealLogDTO, MEAL_TYPES, MealType } from "@/types";
import MealEntry from "@/components/meal-log/MealEntry";
import AddMealForm from "@/components/meal-log/AddMealForm";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  dinner: "🌙 Dinner",
  snack: "🍎 Snack",
};

interface Props {
  title: string;
  meals: MealLogDTO[];
  readOnly: boolean;
  accent: "brand" | "partner";
  date: string;
  onAdd?: (meal: MealLogDTO) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (meal: MealLogDTO) => void;
}

export default function MealColumn({ title, meals, readOnly, accent, date, onAdd, onDelete, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <Card className={`overflow-hidden ${accent === "brand" ? "border-brand-200" : "border-partner-200"}`}>
      <div className={`h-1.5 ${accent === "brand" ? "bg-gradient-to-r from-brand-500 to-brand-400" : "bg-gradient-to-r from-partner-500 to-partner-400"}`} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className={`h-8 w-8 ${accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-partner-100 text-partner-700"}`}>
              <AvatarFallback className={accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-partner-100 text-partner-700"}>
                {title[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">{title}</span>
          </div>
          <Badge variant={accent}>
            {meals.length} logged
          </Badge>
        </div>

        {meals.length === 0 && readOnly ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-2xl mb-2">🍽️</p>
            <p className="text-sm">Nothing yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {MEAL_TYPES.map((type) => {
              const group = meals.filter((m) => m.mealType === type);
              if (group.length === 0) return null;
              return (
                <div key={type}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{MEAL_LABELS[type]}</p>
                  <div className="space-y-1">
                    {group.map((meal) => (
                      <MealEntry
                        key={meal.id}
                        meal={meal}
                        readOnly={readOnly}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!readOnly && (
          <>
            <Separator className="my-3" />
            {showForm ? (
              <AddMealForm
                date={date}
                onAdd={(meal) => {
                  onAdd?.(meal);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full text-xs font-medium text-brand-600 hover:text-brand-700 py-2 border border-dashed border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
              >
                + Log a meal
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}