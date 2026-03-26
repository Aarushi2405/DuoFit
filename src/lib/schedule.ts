import { FitnessScheduleDTO } from "@/types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Returns items paired with their day offset from weekStart (0=Mon … 6=Sun) */
export function generateItemsForWeek(schedule: FitnessScheduleDTO): { label: string; dayOffset: number }[] {
  const items: { label: string; dayOffset: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const dayNum = i + 1; // 1=Mon … 7=Sun
    const dayLabel = DAY_NAMES[i];

    if (schedule.workoutDays.includes(dayNum)) {
      items.push({ label: `${dayLabel} – Workout 💪`, dayOffset: i });
    }
    if (schedule.runDays.includes(dayNum)) {
      items.push({ label: `${dayLabel} – Run 🏃`, dayOffset: i });
    }
    if (schedule.dailySteps) {
      items.push({ label: `${dayLabel} – ${schedule.dailySteps.toLocaleString()} steps 👟`, dayOffset: i });
    }
  }

  return items;
}

/** @deprecated use generateItemsForWeek */
export function generateLabelsForWeek(schedule: FitnessScheduleDTO): string[] {
  return generateItemsForWeek(schedule).map((i) => i.label);
}

export function parseDays(str: string): number[] {
  if (!str) return [];
  return str.split(",").map(Number).filter((n) => n >= 1 && n <= 7);
}

export function serializeDays(days: number[]): string {
  return days.join(",");
}
