import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "partner";
  blur?: "sm" | "md" | "lg";
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className,
  variant = "default",
  blur = "md",
  padding = "md",
  ...props
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-xl",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const variantClasses = {
    default: "bg-white/80 border-white/20",
    brand: "bg-brand-50/80 border-brand-100/50",
    partner: "bg-partner-50/80 border-partner-100/50",
  };

  return (
    <div
      className={cn(
        "rounded-xl border",
        blurClasses[blur],
        paddingClasses[padding],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}