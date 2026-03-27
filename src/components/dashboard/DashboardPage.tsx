"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useUser } from "@/components/providers/UserContext";
import { ChecklistItem, MealLog } from "@/generated/prisma";
import PairPartnerModal from "@/components/dashboard/PairPartnerModal";
import ScheduleModal from "@/components/schedule/ScheduleModal";
import UserCard from "@/components/dashboard/UserCard";
import { Calendar, Settings, LogOut, Plus } from "lucide-react";

const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isItemForLocalToday(item: ChecklistItem): boolean {
  const now = new Date();
  const todayAbbrev = DAY_ABBREVS[now.getDay()];
  const todayStr = localDateStr(now);
  const dayPrefixes = DAY_ABBREVS.map((d) => d + " –");
  const hasDayPrefix = dayPrefixes.some((p) => item.label.startsWith(p));
  if (hasDayPrefix) return item.label.startsWith(todayAbbrev + " –");
  if (item.logDate) return localDateStr(new Date(item.logDate as unknown as string)) === todayStr;
  return true;
}

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

export default function DashboardPage({ me, partner, hasSchedule, today }: Props) {
  const { me: userInfo } = useUser();
  const [myItems, setMyItems] = useState<TaskItem[]>(
    me.checklist.filter(isItemForLocalToday).map((i) => ({ id: i.id, label: i.label, done: i.done }))
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

  const partnerItems: TaskItem[] = useMemo(
    () => (partner?.checklist ?? []).filter(isItemForLocalToday).map((i) => ({ id: i.id, label: i.label, done: i.done })),
    [partner]
  );

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
          <UserCard
            name={me.name}
            items={myItems}
            meals={myMeals}
            streak={me.streak}
            readOnly={false}
            accent="brand"
            today={today}
            defaultCollapsed={false}
            onToggle={handleToggle}
            onMealAdd={handleMealAdd}
            onMealUpdate={handleMealUpdate}
            onMealDelete={handleMealDelete}
          />
          {partner ? (
            <UserCard
              name={partner.name}
              items={partnerItems}
              meals={partner.meals}
              streak={partner.streak}
              readOnly
              accent="partner"
              today={today}
              defaultCollapsed={true}
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