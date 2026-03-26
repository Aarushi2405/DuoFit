"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Separator } from "@/components/ui/Separator";
import { useUser } from "@/components/providers/UserContext";
import { ChecklistItem, MealLog } from "@/generated/prisma/client";
import PairPartnerModal from "@/components/dashboard/PairPartnerModal";
import ScheduleModal from "@/components/schedule/ScheduleModal";
import MealRow from "@/components/dashboard/MealRow";
import { Flame, Calendar, Settings, LogOut, Plus } from "lucide-react";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

interface TaskItem {
  id: string;
  label: string;
  done: boolean;
}

interface UserStats {
  name: string;
  checklist: ChecklistItem[];
  meals: MealLog[];
  streak: number;
}

interface Props {
  me: UserStats;
  partner: UserStats | null;
  hasSchedule: boolean;
  today: string;
}

function TaskRow({ item, readOnly, onToggle }: {
  item: TaskItem;
  readOnly: boolean;
  onToggle?: (id: string, done: boolean) => void;
}) {
  const [localDone, setLocalDone] = useState(item.done);

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

  return (
    <button
      onClick={readOnly ? undefined : handleToggle}
      disabled={readOnly}
      className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 ${
        readOnly ? "cursor-default opacity-60" : "cursor-pointer hover:bg-muted/50 active:scale-[0.98]"
      }`}
    >
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
          localDone
            ? "bg-brand-500 border-brand-500 scale-100"
            : "border-muted-foreground/30 hover:border-brand-400"
        }`}
      >
        {localDone && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
            <path d="M2.5 6l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm text-left flex-1 ${localDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
        {item.label}
      </span>
    </button>
  );
}

function UserColumn({
  name,
  items,
  meals,
  streak,
  readOnly,
  accent,
  today,
  onToggle,
  onMealAdd,
  onMealUpdate,
  onMealDelete,
}: {
  name: string;
  items: TaskItem[];
  meals: MealLog[];
  streak: number;
  readOnly: boolean;
  accent: "brand" | "partner";
  today: string;
  onToggle?: (id: string, done: boolean) => void;
  onMealAdd?: (meal: MealLog) => void;
  onMealUpdate?: (meal: MealLog) => void;
  onMealDelete?: (id: string) => void;
}) {
  const done = items.filter((i) => i.done).length;
  const progress = items.length > 0 ? (done / items.length) * 100 : 0;

  return (
    <Card className={`flex-1 overflow-hidden ${accent === "brand" ? "border-brand-200" : "border-partner-200"}`}>
      <div className={`h-1.5 ${accent === "brand" ? "bg-gradient-to-r from-brand-500 to-brand-400" : "bg-gradient-to-r from-partner-500 to-partner-400"}`} />
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className={`h-10 w-10 ${accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-partner-100 text-partner-700"}`}>
            <AvatarFallback className={accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-partner-100 text-partner-700"}>
              {name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{name}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>{streak} day streak</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tasks</span>
            <Badge variant={accent} className="text-xs">
              {done}/{items.length}
            </Badge>
          </div>
          <Progress value={progress} variant={accent} size="sm" />
        </div>

        <div className="space-y-1 mb-4">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2 text-center">No tasks today</p>
          ) : (
            items.map((item) => (
              <TaskRow key={item.id} item={item} readOnly={readOnly} onToggle={onToggle} />
            ))
          )}
        </div>

        <Separator className="my-3" />

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Meals</p>
          <div className="space-y-2">
            {MEAL_TYPES.map((type) => {
              const entry = meals.find((m) => m.mealType === type) ?? null;
              return (
                <MealRow
                  key={type}
                  mealType={type}
                  entry={entry}
                  readOnly={readOnly}
                  today={today}
                  onAdd={onMealAdd ?? (() => {})}
                  onUpdate={onMealUpdate ?? (() => {})}
                  onDelete={onMealDelete ?? (() => {})}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage({ me, partner, hasSchedule, today }: Props) {
  const { me: userInfo } = useUser();
  const [myItems, setMyItems] = useState<TaskItem[]>(
    me.checklist.map((i) => ({ id: i.id, label: i.label, done: i.done }))
  );
  const [myMeals, setMyMeals] = useState<MealLog[]>(me.meals);
  const [showPairModal, setShowPairModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  function handleToggle(id: string, done: boolean) {
    setMyItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)));
  }

  function handleMealAdd(meal: MealLog) {
    setMyMeals((prev) => [...prev.filter((m) => m.mealType !== meal.mealType), meal]);
  }
  function handleMealUpdate(meal: MealLog) {
    setMyMeals((prev) => prev.map((m) => (m.id === meal.id ? meal : m)));
  }
  function handleMealDelete(id: string) {
    setMyMeals((prev) => prev.filter((m) => m.id !== id));
  }

  const partnerItems: TaskItem[] = (partner?.checklist ?? []).map((i) => ({
    id: i.id, label: i.label, done: i.done,
  }));

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-muted-foreground">{todayLabel}</p>
            <h1 className="text-2xl font-bold text-foreground">Today</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
            >
              {hasSchedule ? <Settings className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{hasSchedule ? "Schedule" : "Add schedule"}</span>
            </button>
            <LogoutButton />
          </div>
        </div>

        {partner && (
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              <span>💑</span>
              <span>Couple streak: {Math.min(me.streak, partner.streak)} days</span>
            </Badge>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <UserColumn
            name={me.name}
            items={myItems}
            meals={myMeals}
            streak={me.streak}
            readOnly={false}
            accent="brand"
            today={today}
            onToggle={handleToggle}
            onMealAdd={handleMealAdd}
            onMealUpdate={handleMealUpdate}
            onMealDelete={handleMealDelete}
          />
          {partner ? (
            <UserColumn
              name={partner.name}
              items={partnerItems}
              meals={partner.meals}
              streak={partner.streak}
              readOnly
              accent="partner"
              today={today}
            />
          ) : (
            <Card className="flex-1 border-dashed flex flex-col items-center justify-center text-center py-8 gap-3">
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <p className="text-4xl">👫</p>
                <p className="text-sm font-medium text-foreground">No partner yet</p>
                <div className="flex flex-col gap-2 items-center w-full">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-xs w-full justify-center">
                    <span className="text-muted-foreground">Your code:</span>
                    <code className="font-mono font-bold text-brand-600">{userInfo.inviteCode}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(userInfo.inviteCode)} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      📋
                    </button>
                  </div>
                  <Button onClick={() => setShowPairModal(true)} variant="outline" size="sm" className="w-full">
                    Enter partner code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {!hasSchedule && (
          <Card className="bg-gradient-to-r from-brand-50 to-partner-50 border-brand-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-background rounded-lg shadow-sm">
                  <Calendar className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Set up your fitness schedule</p>
                  <p className="text-sm text-muted-foreground mt-0.5 mb-3">
                    Set your workout days, run days, and steps goal — we&apos;ll auto-fill your checklist.
                  </p>
                  <Button size="sm" variant="brand" onClick={() => setShowScheduleModal(true)}>
                    Set up schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showPairModal && <PairPartnerModal onClose={() => setShowPairModal(false)} />}
      {showScheduleModal && <ScheduleModal onClose={() => setShowScheduleModal(false)} />}
    </div>
  );
}

function LogoutButton() {
  const { me } = useUser();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Avatar className="h-8 w-8 bg-brand-100 text-brand-700">
        <AvatarFallback className="bg-brand-100 text-brand-700">
          {me.name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <LogOut className="h-4 w-4" />
    </button>
  );
}