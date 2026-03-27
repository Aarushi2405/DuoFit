import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "brand" | "partner" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showValue?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = "default",
      size = "md",
      animated = true,
      showValue = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const variantClasses = {
      default: "bg-primary",
      brand: "bg-gradient-to-r from-brand-500 to-brand-600",
      partner: "bg-gradient-to-r from-partner-400 to-partner-500",
      success: "bg-green-500",
      warning: "bg-amber-500",
    };

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3",
    };

    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-secondary",
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all",
              variantClasses[variant],
              animated && "transition-[width] duration-500 ease-out"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <p className="mt-1 text-xs text-muted-foreground text-right">
            {Math.round(percentage)}%
          </p>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };