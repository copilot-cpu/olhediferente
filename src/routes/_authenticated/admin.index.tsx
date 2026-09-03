import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, PreviewLink } from "@/components/admin/ui";
import { ErrorState, LoadingState } from "@/components/ds/feedback";
import { supabase } from "@/integrations/supabase/client";
import { mapRow, secondsToHms } from "@/lib/webinar-settings";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [{ title: "Dashboard — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboardPage,
});

function startOfToday(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border/60 px-4 py-4">
      <p className="text-overline text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function AdminDashboardPage() {
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [total, today, settings, events, offer] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfToday()),
        supabase
          .from("webinar_settings")
          .select("key,title,video_url,config")
          .eq("key", "main")
          .maybeSingle(),
        supabase
          .from("webinar_events")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("offer_content")
          .select("checkout_url")
          .eq("block_key", "offer")
          .maybeSingle(),
      ]);

      const firstError =
        total.error ?? today.error ?? settings.error ?? events.error ?? offer.error;
      if (firstError) throw firstError;

      return {
        leadsTotal: total.count ?? 0,
        leadsToday: today.count ?? 0,
        settings: mapRow(settings.data),
        hasVideo: Boolean(settings.data?.video_url),
        activeEvents: events.count ?? 0,
        checkoutUrl: offer.data?.checkout_url ?? "",
      };
    },
  });

  if (overview.isLoading) {
    return (
      <AdminShell title="Dashboard" description="Visão geral do sistema">
        <LoadingState label="Carregando indicadores" />
      </AdminShell>
    );
  }

  if (overview.isError || !overview.data) {
    return (
      <AdminShell title="Dashboard" description="Visão geral do sistema">
        <ErrorState description="Não foi possível carregar os indicadores." />
      </AdminShell>
    );
  }

  const data = overview.data;
  const checkoutOk = /^https?:\/\//i.test(data.checkoutUrl.trim());

  const checklist = [
    { label: "Vídeo da aula configurado", ok: data.hasVideo, to: "/admin/webinar" },
    { label: "Link de checkout configurado", ok: checkoutOk, to: "/admin/oferta" },
    {
      label: "Momento da oferta definido em horário real",
      ok: data.settings.offerRevealSeconds >= 120,
      to: "/admin/webinar",
    },
    {
      label: data.settings.simulationMode
        ? "Notificações simuladas ligadas"
        : "Notificações simuladas desligadas",
      ok: true,
      to: "/admin/simulacao",
    },
  ];

  return (
    <AdminShell title="Dashboard" description="Visão geral do sistema">
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Inscritos" value={String(data.leadsTotal)} hint="Total capturado" />
          <Metric label="Hoje" value={String(data.leadsToday)} hint="Inscritos nas últimas horas" />
          <Metric
            label="Oferta libera em"
            value={secondsToHms(data.settings.offerRevealSeconds)}
            hint="Tempo real assistido"
          />
          <Metric
            label="Eventos ativos"
            value={String(data.activeEvents)}
            hint={data.settings.simulationMode ? "Simulação ligada" : "Simulação desligada"}
          />
        </div>

        <AdminCard title="Checklist de publicação">
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li
                key={item.label}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/60 px-4 py-3"
              >
                <span className="text-sm text-foreground">
                  <span
                    aria-hidden
                    className={
                      item.ok
                        ? "mr-2 inline-block size-2 rounded-full bg-primary"
                        : "mr-2 inline-block size-2 rounded-full bg-destructive"
                    }
                  />
                  {item.label}
                  <span className="sr-only">{item.ok ? " (pronto)" : " (pendente)"}</span>
                </span>
                <Link to={item.to} className="text-xs uppercase tracking-wide text-primary">
                  Ajustar
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard title="Atalhos" description="Abra as páginas públicas em uma nova aba.">
          <div className="flex flex-wrap gap-2">
            <PreviewLink to="/" label="PÁGINA DE CAPTAÇÃO" />
            <PreviewLink to="/aula" label="PÁGINA DA AULA" />
            <PreviewLink to="/admin/preview" label="PRÉ-VISUALIZAR OFERTA" />
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
