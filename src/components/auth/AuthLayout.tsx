import Link from "next/link";

function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-partner-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-brand-300/20 to-transparent rounded-full blur-3xl" />
    </div>
  );
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  linkText,
  linkHref,
  linkAnchorText,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  linkText: string;
  linkHref: string;
  linkAnchorText: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <GradientOrbs />
      
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-partner-500 bg-clip-text text-transparent">
              DuoFit
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-partner-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-6 sm:p-8 animate-scale-in">
            <h2 className="text-xl font-semibold text-foreground mb-6">{title}</h2>
            {children}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {linkText}{" "}
              <Link 
                href={linkHref} 
                className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                {linkAnchorText}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground/60 animate-fade-in">
          <p>Fitness, together.</p>
        </div>
      </div>
    </div>
  );
}