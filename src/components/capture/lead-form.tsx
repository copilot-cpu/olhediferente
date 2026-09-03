import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "h-11 rounded-sm border-transparent bg-cream text-base text-[var(--forest-deep)] shadow-none placeholder:text-[var(--forest-deep)]/45 focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Informe seu nome completo." })
    .max(120, { message: "Nome muito longo." }),
  email: z
    .string()
    .trim()
    .email({ message: "Informe um e-mail válido." })
    .max(255, { message: "E-mail muito longo." }),
  whatsapp: z
    .string()
    .trim()
    .max(25, { message: "Número muito longo." })
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Informe um WhatsApp válido com DDD.",
    }),
});

type Errors = Partial<Record<"name" | "email" | "whatsapp", string>>;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function collectTracking() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  const params = new URLSearchParams(window.location.search);
  const tracking: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) tracking[key] = value.slice(0, 200);
  }
  if (document.referrer) tracking["referrer"] = document.referrer.slice(0, 500);
  return tracking;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function LeadForm({
  ctaLabel,
  microcopy,
  source,
  className,
  idPrefix,
}: {
  ctaLabel: string;
  microcopy?: string;
  source: string;
  className?: string;
  idPrefix: string;
}) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", whatsapp: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setSubmitting(true);

    const tracking = collectTracking();
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.whatsapp,
      source,
      consent: true,
      metadata: { whatsapp: parsed.data.whatsapp, ...tracking },
    });

    if (error) {
      setSubmitting(false);
      setFormError(
        "Não conseguimos registrar sua inscrição agora. Verifique sua conexão e tente novamente em instantes.",
      );
      return;
    }

    navigate({ to: "/aula" });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("min-w-0 space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Nome</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          aria-invalid={!!errors.name}
          disabled={submitting}
          className={FIELD_CLASS}
        />
        {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>E-mail</Label>
        <Input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          aria-invalid={!!errors.email}
          disabled={submitting}
          className={FIELD_CLASS}
        />
        {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-whatsapp`}>WhatsApp</Label>
        <Input
          id={`${idPrefix}-whatsapp`}
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          value={values.whatsapp}
          onChange={(e) => setValues((v) => ({ ...v, whatsapp: maskPhone(e.target.value) }))}
          aria-invalid={!!errors.whatsapp}
          disabled={submitting}
          className={FIELD_CLASS}
        />
        {errors.whatsapp ? <p className="text-xs text-destructive">{errors.whatsapp}</p> : null}
      </div>

      {formError ? (
        <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-foreground">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="gold"
        size="lg"
        disabled={submitting}
        className="h-auto min-h-12 w-full whitespace-normal py-3 text-balance leading-snug transition-transform duration-300 hover:-translate-y-0.5"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Reservando sua vaga
          </>
        ) : (
          ctaLabel
        )}
      </Button>

      {microcopy ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{microcopy}</p>
      ) : null}
    </form>
  );
}
