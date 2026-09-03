import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type WebinarEventType = "simulation_purchase" | "offer_reveal" | "custom";

export type WebinarEvent = {
  id: string;
  eventType: WebinarEventType;
  /** Nome exibido (coluna `title`). */
  name: string;
  /** Mensagem (payload.message). */
  message: string;
  /** Momento do disparo em segundos (coluna `trigger_at_seconds`). */
  triggerSeconds: number;
  /** Duração de exibição em segundos (payload.display_duration). */
  displayDuration: number;
  isActive: boolean;
};

export const DEFAULT_PURCHASE_MESSAGE = "acabou de garantir sua vaga.";
export const DEFAULT_DISPLAY_DURATION = 5;

type Row = {
  id: string;
  event_type: string;
  title: string | null;
  trigger_at_seconds: number;
  payload: unknown;
  is_active: boolean;
};

export function mapEvent(row: Row): WebinarEvent {
  const payload =
    row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
      ? (row.payload as Record<string, unknown>)
      : {};
  const message =
    typeof payload["message"] === "string" && (payload["message"] as string).trim()
      ? (payload["message"] as string).trim()
      : DEFAULT_PURCHASE_MESSAGE;
  const duration =
    typeof payload["display_duration"] === "number" && (payload["display_duration"] as number) > 0
      ? (payload["display_duration"] as number)
      : DEFAULT_DISPLAY_DURATION;

  return {
    id: row.id,
    eventType: (row.event_type as WebinarEventType) ?? "custom",
    name: row.title?.trim() || "",
    message,
    triggerSeconds: row.trigger_at_seconds ?? 0,
    displayDuration: duration,
    isActive: row.is_active,
  };
}

const SELECT = "id,event_type,title,trigger_at_seconds,payload,is_active";

/** Eventos ativos, leitura pública permitida pelo RLS. */
export function useWebinarEvents(enabled = true) {
  const query = useQuery({
    queryKey: ["webinar-events", "public"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webinar_events")
        .select(SELECT)
        .eq("is_active", true)
        .order("trigger_at_seconds", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as Row[]).map(mapEvent);
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  return { events: query.data ?? [], isLoading: query.isLoading };
}

/** Todos os eventos (admin). */
export function useAdminWebinarEvents() {
  return useQuery({
    queryKey: ["admin-webinar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webinar_events")
        .select(SELECT)
        .order("trigger_at_seconds", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as Row[]).map(mapEvent);
    },
  });
}
