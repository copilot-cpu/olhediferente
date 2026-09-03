import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { PandaPlayerAdapter } from "@/lib/panda-player";
import type { WebinarEvent } from "@/lib/webinar-events";
import type { WebinarSettings } from "@/lib/webinar-settings";

const STORAGE_PREFIX = "olhe-diferente:webinar:main";
const UNLOCK_KEY = `${STORAGE_PREFIX}:offer-unlocked`;
const FIRED_KEY = `${STORAGE_PREFIX}:fired-events`;

function readFired(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(FIRED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function persistFired(ids: Set<string>) {
  try {
    window.sessionStorage.setItem(FIRED_KEY, JSON.stringify([...ids]));
  } catch {
    /* storage indisponível */
  }
}

export type QueuedToast = {
  key: string;
  name: string;
  message: string;
  durationMs: number;
};

/**
 * Engine temporal do webinar.
 *
 * Toda a linha do tempo vem exclusivamente do `currentTime` real do player Panda.
 * Não existe relógio próprio, `Date.now`, duração estimada ou intervalo de alta
 * frequência: reagimos apenas aos eventos oficiais do player.
 */
export function useWebinarEngine({
  adapter,
  settings,
  events,
}: {
  adapter: PandaPlayerAdapter | null;
  settings: WebinarSettings;
  events: WebinarEvent[];
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [offerUnlocked, setOfferUnlocked] = useState(false);
  const [visibleToast, setVisibleToast] = useState<QueuedToast | null>(null);

  const queueRef = useRef<QueuedToast[]>([]);
  const firedRef = useRef<Set<string>>(new Set());
  const lastTimeRef = useRef<number | null>(null);
  const warnedRef = useRef(false);

  const revealSeconds = settings.offerRevealSeconds;

  // Estado persistido: a oferta, uma vez liberada, permanece liberada.
  useEffect(() => {
    firedRef.current = readFired();
    try {
      if (window.localStorage.getItem(UNLOCK_KEY) === "true") setOfferUnlocked(true);
    } catch {
      /* storage indisponível */
    }
  }, []);

  const visibleRef = useRef<QueuedToast | null>(null);
  const pump = useCallback(() => {
    if (visibleRef.current) return;
    const next = queueRef.current.shift() ?? null;
    visibleRef.current = next;
    setVisibleToast(next);
  }, []);


  useEffect(() => {
    if (!visibleToast) return;
    const timer = window.setTimeout(() => {
      visibleRef.current = null;
      setVisibleToast(null);
      window.setTimeout(pump, 350);
    }, visibleToast.durationMs);

    return () => window.clearTimeout(timer);
  }, [visibleToast, pump]);

  const activeEvents = useMemo(
    () =>
      events
        .filter((event) => event.isActive)
        .filter((event) =>
          event.eventType === "simulation_purchase" ? settings.simulationMode : true,
        )
        .sort((a, b) => a.triggerSeconds - b.triggerSeconds),
    [events, settings.simulationMode],
  );

  const activeEventsRef = useRef(activeEvents);
  activeEventsRef.current = activeEvents;
  const revealRef = useRef(revealSeconds);
  revealRef.current = revealSeconds;

  useEffect(() => {
    if (!adapter) return;

    const handle = (time: number) => {
      if (!Number.isFinite(time)) return;
      setCurrentTime(time);

      const previous = lastTimeRef.current;
      lastTimeRef.current = time;

      // Liberação da oferta: só a partir do tempo real assistido.
      if (revealRef.current > 0 && time >= revealRef.current) {
        setOfferUnlocked((unlocked) => {
          if (!unlocked) {
            try {
              window.localStorage.setItem(UNLOCK_KEY, "true");
            } catch {
              /* storage indisponível */
            }
          }
          return true;
        });
      }

      // Primeira leitura apenas define a referência (evita disparo em massa
      // quando o usuário retoma o vídeo em um ponto avançado).
      if (previous === null) return;

      let queued = false;
      for (const event of activeEventsRef.current) {
        const crossed = previous < event.triggerSeconds && time >= event.triggerSeconds;
        if (!crossed || firedRef.current.has(event.id)) continue;
        firedRef.current.add(event.id);
        queueRef.current.push({
          key: `${event.id}-${Math.round(time)}`,
          name: event.name,
          message: event.message,
          durationMs: Math.max(1, event.displayDuration) * 1000,
        });
        queued = true;
      }
      if (queued) {
        persistFired(firedRef.current);
        pump();
      }
    };

    const unsubscribe = adapter.subscribe((state, event) => {
      if (event === "ready") setIsReady(true);
      if (event === "play") {
        setIsReady(true);
        setHasStarted(true);
      }
      if (event === "timeupdate" || event === "play" || event === "seeked" || event === "ended") {
        if (import.meta.env.DEV && !Number.isFinite(state.currentTime) && !warnedRef.current) {
          warnedRef.current = true;
          console.warn("[webinar-engine] currentTime indisponível no player Panda.");
        }
        handle(state.currentTime);
      }
    });

    return unsubscribe;
  }, [adapter, pump]);

  return {
    currentTime,
    isReady,
    hasStarted,
    offerUnlocked,
    visibleToast,
    activeEventsCount: activeEvents.length,
  };
}
