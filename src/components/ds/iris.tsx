import { cn } from "@/lib/utils";

/** Marca visual inspirada na íris humana. Puramente decorativa. */
export function IrisMark({
  className,
  size = 220,
}: {
  className?: string;
  size?: number | string;
}) {
  const sizeStyle =
    size === undefined || size === ""
      ? undefined
      : typeof size === "number"
        ? { width: size, height: size }
        : { width: size, height: size };
  return (
    <div
      aria-hidden
      className={cn("iris-field relative shrink-0", className)}
      style={sizeStyle}
    >
      <div
        className="absolute inset-[14%] rounded-full border border-primary/25"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, transparent 0deg 3deg, oklch(0.76 0.115 82 / 0.18) 3deg 4deg)",
        }}
      />
      <div className="absolute inset-[36%] rounded-full bg-background shadow-[0_0_40px_oklch(0.76_0.115_82_/_0.25)_inset]" />
      <div className="absolute inset-0 rounded-full ring-1 ring-primary/25" />
    </div>
  );
}

export function IrisGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="iris-field absolute -top-40 -right-32 size-[32rem] opacity-25 blur-2xl" />
      <div className="iris-field absolute -bottom-56 -left-40 size-[28rem] opacity-15 blur-3xl" />
    </div>
  );
}
