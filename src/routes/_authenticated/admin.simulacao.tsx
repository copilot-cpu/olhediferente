import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/ds/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_DISPLAY_DURATION,
  DEFAULT_PURCHASE_MESSAGE,
  useAdminWebinarEvents,
  type WebinarEvent,
} from "@/lib/webinar-events";
import { hmsToSeconds, secondsToHms } from "@/lib/webinar-settings";

export const Route = createFileRoute("/_authenticated/admin/simulacao")({
  head: () => ({
    meta: [{ title: "Simulação — Painel OLHE DIFERENTE" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminSimulacaoPage,
});

type Draft = {
  id: string | null;
  time: string;
  name: string;
  message: string;
  duration: number;
  isActive: boolean;
};

const emptyDraft: Draft = {
  id: null,
  time: "01:03:45",
  name: "",
  message: DEFAULT_PURCHASE_MESSAGE,
  duration: DEFAULT_DISPLAY_DURATION,
  isActive: true,
};

function toDraft(event: WebinarEvent): Draft {
  return {
    id: event.id,
    time: secondsToHms(event.triggerSeconds),
    name: event.name,
    message: event.message,
    duration: event.displayDuration,
    isActive: event.isActive,
  };
}

function AdminSimulacaoPage() {
  const queryClient = useQueryClient();
  const eventsQuery = useAdminWebinarEvents();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-webinar-events"] });
    void queryClient.invalidateQueries({ queryKey: ["webinar-events"] });
  };

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const seconds = hmsToSeconds(value.time);
      if (seconds === null) throw new Error("Informe o horário no formato HH:MM:SS.");
      if (!value.name.trim()) throw new Error("Informe o nome exibido.");

      const row = {
        event_type: "simulation_purchase",
        title: value.name.trim(),
        trigger_at_seconds: seconds,
        is_active: value.isActive,
        payload: {
          message: value.message.trim() || DEFAULT_PURCHASE_MESSAGE,
          display_duration: Number(value.duration) > 0 ? Number(value.duration) : DEFAULT_DISPLAY_DURATION,
        },
      };

      const { error } = value.id
        ? await supabase.from("webinar_events").update(row).eq("id", value.id)
        : await supabase.from("webinar_events").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Evento salvo." });
      setDraft(emptyDraft);
      invalidate();
    },
    onError: (error: unknown) => {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível salvar.",
      });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("webinar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback({ type: "ok", message: "Evento removido." });
      setDraft((d) => (d.id ? emptyDraft : d));
      invalidate();
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("webinar_events")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const createSequence = useMutation({
    mutationFn: async (value: { start: string; count: number; step: number; names: string }) => {
      const start = hmsToSeconds(value.start);
      if (start === null) throw new Error("Informe o horário inicial no formato HH:MM:SS.");
      const names = value.names
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean);
      if (names.length === 0) throw new Error("Informe ao menos um nome (um por linha).");
      const count = Math.min(Math.max(Number(value.count) || 0, 1), 50);
      const step = Math.max(Number(value.step) || 1, 1);

      const rows = Array.from({ length: count }, (_, index) => ({
        event_type: "simulation_purchase",
        title: names[index % names.length] as string,
        trigger_at_seconds: start + index * step,
        is_active: true,
        payload: {
          message: DEFAULT_PURCHASE_MESSAGE,
          display_duration: DEFAULT_DISPLAY_DURATION,
        },
      }));

      const { error } = await supabase.from("webinar_events").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: (created) => {
      setFeedback({ type: "ok", message: `${created} evento(s) criados.` });
      invalidate();
    },
    onError: (error: unknown) =>
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível criar a sequência.",
      }),
  });

  const events = eventsQuery.data ?? [];


  return (
    <AdminShell title="Simulação" description="Eventos simulados da aula">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {eventsQuery.isLoading ? (
            <LoadingState label="Carregando eventos" />
          ) : eventsQuery.isError ? (
            <ErrorState description="Não foi possível carregar os eventos." />
          ) : events.length === 0 ? (
            <EmptyState title="Nenhum evento" description="Cadastre o primeiro evento simulado." />
          ) : (
            <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
              {events.map((event) => (
                <li key={event.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="font-sans text-xs tabular-nums text-primary">
                    {secondsToHms(event.triggerSeconds)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    <span className="font-medium">{event.name}</span>{" "}
                    <span className="text-muted-foreground">{event.message}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{event.displayDuration}s</span>
                  <Switch
                    checked={event.isActive}
                    onCheckedChange={(checked) =>
                      toggle.mutate({ id: event.id, isActive: checked })
                    }
                    aria-label="Ativar evento"
                  />
                  <Button variant="ghost" size="sm" onClick={() => setDraft(toDraft(event))}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDraft({ ...toDraft(event), id: null })}
                  >
                    Duplicar
                  </Button>
                  <ConfirmDelete
                    title="Excluir evento?"
                    description={`O evento de ${event.name} será removido.`}
                    disabled={remove.isPending}
                    onConfirm={() => remove.mutate(event.id)}
                  />

                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          className="space-y-4 rounded-lg border border-border/60 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setFeedback(null);
            save.mutate(draft);
          }}
        >
          <p className="text-overline">{draft.id ? "Editar evento" : "Novo evento"}</p>

          <div className="space-y-2">
            <Label htmlFor="time">Horário (HH:MM:SS)</Label>
            <Input
              id="time"
              value={draft.time}
              onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Input
              id="message"
              value={draft.message}
              onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração de exibição (segundos)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={draft.duration}
              onChange={(e) => setDraft((d) => ({ ...d, duration: Number(e.target.value) }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Ativo</Label>
            <Switch
              id="active"
              checked={draft.isActive}
              onCheckedChange={(checked) => setDraft((d) => ({ ...d, isActive: checked }))}
            />
          </div>

          {feedback ? (
            <p
              className={
                feedback.type === "ok" ? "text-sm text-primary" : "text-sm text-destructive"
              }
            >
              {feedback.message}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Salvando…" : "SALVAR"}
            </Button>
            {draft.id ? (
              <Button type="button" variant="ghost" onClick={() => setDraft(emptyDraft)}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
