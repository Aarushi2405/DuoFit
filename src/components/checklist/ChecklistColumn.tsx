"use client";

import { useState } from "react";
import { ChecklistItemDTO } from "@/types";
import ChecklistItemRow from "@/components/checklist/ChecklistItemRow";
import AddItemForm from "@/components/checklist/AddItemForm";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Flame } from "lucide-react";

interface Props {
  title: string;
  items: ChecklistItemDTO[];
  readOnly: boolean;
  accent: "brand" | "partner";
  weekStart: string;
  onAdd?: (item: ChecklistItemDTO) => void;
  onToggle?: (id: string, done: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (item: ChecklistItemDTO) => void;
}

export default function ChecklistColumn({ title, items, readOnly, accent, weekStart, onAdd, onToggle, onDelete, onUpdate }: Props) {
  const done = items.filter((i) => i.done).length;

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
            {done}/{items.length}
          </Badge>
        </div>

        {readOnly && items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm">Nothing yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                readOnly={readOnly}
                accent={accent}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}

        {!readOnly && (
          <>
            <Separator className="my-3" />
            <AddItemForm weekStart={weekStart} onAdd={onAdd!} />
          </>
        )}
      </CardContent>
    </Card>
  );
}