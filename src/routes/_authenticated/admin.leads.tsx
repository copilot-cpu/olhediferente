import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCard, FieldGrid, TextField } from "@/components/admin/ui";
import { EmptyState, ErrorState, LoadingState } from "@/components/ds/feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({
    meta: [{ title: "Leads — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLeadsPage,
});

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  created_at: string;
  metadata: unknown;
};

const PAGE_SIZE = 25;

function meta(lead: Lead): Record<string, unknown> {
  return lead.metadata && typeof lead.metadata === "object" && !Array.isArray(lead.metadata)
    ? (lead.metadata as Record<string, unknown>)
    : {};
}

function utm(lead: Lead, key: string): string {
  const data = meta(lead);
  const direct = data[key];
  if (typeof direct === "string") return direct;
  const nested = data["utm"];
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const value = (nested as Record<string, unknown>)[key.replace("utm_", "")];
    if (typeof value === "string") return value;
    const value2 = (nested as Record<string, unknown>)[key];
    if (typeof value2 === "string") return value2;
  }
  return "";
}

function referrer(lead: Lead): string {
  const data = meta(lead);
  return typeof data["referrer"] === "string" ? (data["referrer"] as string) : "";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function csvCell(value: string): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function AdminLeadsPage() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(0);

  const leadsQuery = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id,name,email,phone,source,created_at,metadata")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
  });

  const leads = useMemo(() => leadsQuery.data ?? [], [leadsQuery.data]);

  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => l.source).filter(Boolean) as string[])).sort(),
    [leads],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;
    return leads.filter((lead) => {
      if (term) {
        const haystack = `${lead.name} ${lead.email} ${lead.phone ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      const time = new Date(lead.created_at).getTime();
      if (fromTime !== null && time < fromTime) return false;
      if (toTime !== null && time > toTime) return false;
      if (source && (lead.source ?? "") !== source) return false;
      return true;
    });
  }, [leads, search, from, to, source]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  function exportCsv() {
    const header = [
      "Nome",
      "E-mail",
      "WhatsApp",
      "Data",
      "Origem",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "UTM Content",
      "UTM Term",
      "Referrer",
    ];
    const rows = filtered.map((lead) =>
      [
        lead.name,
        lead.email,
        lead.phone ?? "",
        formatDate(lead.created_at),
        lead.source ?? "",
        utm(lead, "utm_source"),
        utm(lead, "utm_medium"),
        utm(lead, "utm_campaign"),
        utm(lead, "utm_content"),
        utm(lead, "utm_term"),
        referrer(lead),
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = `\uFEFF${[header.map(csvCell).join(","), ...rows].join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-olhe-diferente-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell title="Leads" description="Inscrições recebidas pela página de captação">
      <div className="space-y-6">
        <AdminCard
          title="Filtros"
          description={`${filtered.length} inscrição(ões) no filtro atual.`}
          actions={
            <Button type="button" variant="quiet" size="sm" onClick={exportCsv} disabled={!filtered.length}>
              <Download className="size-4" /> EXPORTAR CSV
            </Button>
          }
        >
          <FieldGrid>
            <TextField
              label="Buscar por nome, e-mail ou WhatsApp"
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(0);
              }}
              placeholder="Digite para filtrar"
            />
            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <select
                id="source"
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setPage(0);
                }}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Todas</option>
                {sources.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label="De"
              type="date"
              value={from}
              onChange={(v) => {
                setFrom(v);
                setPage(0);
              }}
            />
            <TextField
              label="Até"
              type="date"
              value={to}
              onChange={(v) => {
                setTo(v);
                setPage(0);
              }}
            />
          </FieldGrid>
        </AdminCard>

        {leadsQuery.isLoading ? (
          <LoadingState label="Carregando inscrições" />
        ) : leadsQuery.isError ? (
          <ErrorState description="Não foi possível carregar as inscrições." />
        ) : leads.length === 0 ? (
          <EmptyState
            title="Ainda não existem inscrições."
            description="Assim que alguém preencher o formulário da página de captação, o cadastro aparece aqui."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma inscrição encontrada"
            description="Ajuste a busca ou os filtros de data e origem."
          />
        ) : (
          <>
            {/* Desktop: tabela · Mobile: cartões */}
            <div className="hidden overflow-x-auto rounded-lg border border-border/60 md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-card/60 text-overline">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">E-mail</th>
                    <th className="px-4 py-3">WhatsApp</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {visible.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-4 py-3 text-foreground">{lead.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.phone ?? "—"}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lead.source || utm(lead, "utm_source") || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {visible.map((lead) => (
                <li key={lead.id} className="rounded-lg border border-border/60 bg-card/40 p-4">
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                  <p className="text-sm text-muted-foreground">{lead.phone ?? "—"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(lead.created_at)} · {lead.source || "origem não informada"}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Página {current + 1} de {pageCount}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="quiet"
                  size="sm"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="quiet"
                  size="sm"
                  disabled={current >= pageCount - 1}
                  onClick={() => setPage(current + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
