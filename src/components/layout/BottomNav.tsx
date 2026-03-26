"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, UtensilsCrossed, Trophy } from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Today",
    icon: Home,
  },
  {
    href: "/checklist",
    label: "Checklist",
    icon: CheckSquare,
  },
  {
    href: "/meal-log",
    label: "Meals",
    icon: UtensilsCrossed,
  },
  {
    href: "/rewards",
    label: "Rewards",
    icon: Trophy,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 transition-all duration-200 ${
                active 
                  ? "text-brand-600" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <div className="absolute inset-x-2 top-0 h-0.5 bg-brand-600 rounded-full" />
              )}
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                active 
                  ? "bg-brand-100" 
                  : ""
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-medium ${
                active ? "text-brand-600" : ""
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}