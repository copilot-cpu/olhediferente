/**
 * Adapter para o player Panda.
 *
 * Baseado na API oficial (https://docs.pandavideo.com/reference/player-api):
 * - script `https://player.pandavideo.com.br/api.v2.js`
 * - `new PandaPlayer(iframeId, { onReady, onError })`
 * - leitura: `getCurrentTime()`, `getDuration()`, `isPaused()`
 * - eventos: `player.onEvent(({ message }) => ...)` com `panda_ready`,
 *   `panda_play`, `panda_pause`, `panda_timeupdate`, `panda_seeking`,
 *   `panda_seeked`, `panda_ended`.
 *
 * Nesta etapa o adapter é usado apenas para saber quando o player ficou pronto
 * ou falhou. Nenhum valor é inventado: `currentTime`/`duration` vêm do player.
 */

export type PandaState = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  hasStarted: boolean;
  ended: boolean;
};

export type PandaEvent =
  | "ready"
  | "error"
  | "play"
  | "pause"
  | "timeupdate"
  | "seeking"
  | "seeked"
  | "ended";

type Listener = (state: PandaState, event: PandaEvent) => void;

const SCRIPT_SRC = "https://player.pandavideo.com.br/api.v2.js";

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { __pandaScript?: Promise<void> };
  if (w.__pandaScript) return w.__pandaScript;
  w.__pandaScript = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("panda script")));
      if ((window as unknown as Record<string, unknown>)["PandaPlayer"]) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("panda script"));
    document.head.appendChild(script);
  });
  return w.__pandaScript;
}

export class PandaPlayerAdapter {
  private instance: unknown = null;
  private listeners = new Set<Listener>();
  private destroyed = false;
  private state: PandaState = {
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    hasStarted: false,
    ended: false,
  };

  constructor(private readonly iframeId: string) {}

  async attach(): Promise<void> {
    if (typeof window === "undefined") return;
    await loadScript();
    if (this.destroyed) return;

    const w = window as unknown as {
      pandascripttag?: Array<() => void>;
      PandaPlayer?: new (id: string, opts: Record<string, unknown>) => unknown;
    };
    w.pandascripttag = w.pandascripttag || [];

    const init = () => {
      if (this.destroyed || !w.PandaPlayer) return;
      const player = new w.PandaPlayer(this.iframeId, {
        onReady: () => {
          this.instance = player;
          this.sync();
          this.emit("ready");
        },
        onError: () => this.emit("error"),
      }) as {
        onEvent?: (cb: (payload: { message?: string }) => void) => void;
      };
      player.onEvent?.(({ message }) => {
        this.instance = player;
        this.sync();
        switch (message) {
          case "panda_play":
            this.state.isPlaying = true;
            this.state.hasStarted = true;
            this.state.ended = false;
            this.emit("play");
            break;
          case "panda_pause":
            this.state.isPlaying = false;
            this.emit("pause");
            break;
          case "panda_timeupdate":
            this.emit("timeupdate");
            break;
          case "panda_seeking":
            this.emit("seeking");
            break;
          case "panda_seeked":
            this.emit("seeked");
            break;
          case "panda_ended":
            this.state.isPlaying = false;
            this.state.ended = true;
            this.emit("ended");
            break;
          case "panda_ready":
            this.emit("ready");
            break;
          default:
            break;
        }
      });
    };

    w.pandascripttag.push(init);
    if (w.PandaPlayer) init();
  }

  private sync() {
    const player = this.instance as
      | { getCurrentTime?: () => number; getDuration?: () => number; isPaused?: () => boolean }
      | null;
    if (!player) return;
    const time = player.getCurrentTime?.();
    const duration = player.getDuration?.();
    if (typeof time === "number" && Number.isFinite(time)) this.state.currentTime = time;
    if (typeof duration === "number" && Number.isFinite(duration)) this.state.duration = duration;
    const paused = player.isPaused?.();
    if (typeof paused === "boolean") this.state.isPlaying = !paused;
  }

  private emit(event: PandaEvent) {
    for (const listener of this.listeners) listener({ ...this.state }, event);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): PandaState {
    this.sync();
    return { ...this.state };
  }

  destroy() {
    this.destroyed = true;
    this.listeners.clear();
    this.instance = null;
  }
}
