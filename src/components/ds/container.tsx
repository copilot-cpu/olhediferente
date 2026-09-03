import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Width = "narrow" | "default" | "wide" | "full";

const widths: Record<Width, string> = {
  narrow: "max-w-2xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

export function Container({
  children,
  width = "default",
  className,
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8", widths[width], className)}>{children}</div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-14 sm:py-20 lg:py-24", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  overline,
  title,
  description,
  align = "left",
}: {
  overline?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <header className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {overline ? <p className="text-overline mb-3">{overline}</p> : null}
      <h2 className="text-title text-foreground">{title}</h2>
      {description ? <p className="text-lede mt-4">{description}</p> : null}
    </header>
  );
}

export function GoldRule({ className }: { className?: string }) {
  return <div className={cn("rule-gold", className)} aria-hidden />;
}
