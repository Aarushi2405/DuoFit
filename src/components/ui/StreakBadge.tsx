import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  variant?: "brand" | "partner";
  className?: string;
}

export function StreakBadge({
  streak,
  size = "md",
  variant = "brand",
  className,
}: StreakBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const variantClasses = {
    brand: "bg-brand-100 text-brand-700 border-brand-200",
    partner: "bg-partner-100 text-partner-700 border-partner-200",
  };

  const iconSize = {
    sm: "12",
    md: "14",
    lg: "16",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <svg
        width={iconSize[size]}
        height={iconSize[size]}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={variant === "brand" ? "text-brand-500" : "text-partner-500"}
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      <span>{streak}</span>
      <span className="font-normal opacity-70">d</span>
    </div>
  );
}