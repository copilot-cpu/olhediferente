import { useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_IMAGE_TYPES,
  removeImage,
  uploadImage,
  useMediaUrl,
} from "@/lib/media";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  ImageOff,
  Loader2,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Estrutura                                                                   */
/* -------------------------------------------------------------------------- */

export function AdminCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-lg border border-border/60 bg-card/40 p-5 sm:p-6", className)}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function FieldGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-5 sm:grid-cols-2", className)}>{children}</div>;
}

let fieldId = 0;

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  const [id] = useState(() => htmlFor ?? `field-${++fieldId}`);
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div id={`${id}-control`}>{children}</div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Campo de texto simples com label associado corretamente. */
export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows,
  type = "text",
  disabled,
  className,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  type?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [id] = useState(() => `input-${++fieldId}`);
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {rows ? (
        <Textarea
          id={id}
          rows={rows}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Feedback de salvamento                                                      */
/* -------------------------------------------------------------------------- */

export type Feedback = { type: "ok" | "error"; message: string } | null;

export function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  const ok = feedback.type === "ok";
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 text-sm",
        ok ? "text-success" : "text-destructive",
      )}
    >
      {ok ? <CheckCircle2 className="size-4" /> : <TriangleAlert className="size-4" />}
      {feedback.message}
    </p>
  );
}

export function SaveBar({
  pending,
  feedback,
  label = "SALVAR ALTERAÇÕES",
  children,
}: {
  pending?: boolean;
  feedback?: Feedback;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-5">
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Salvando…
          </>
        ) : (
          label
        )}
      </Button>
      {children}
      <FeedbackLine feedback={feedback ?? null} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Confirmação de exclusão                                                     */
/* -------------------------------------------------------------------------- */

export function ConfirmDelete({
  onConfirm,
  title = "Excluir item?",
  description = "Esta ação não pode ser desfeita.",
  trigger,
  disabled,
}: {
  onConfirm: () => void;
  title?: string;
  description?: string;
  trigger?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} aria-label="Excluir">
            <Trash2 className="size-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Listas                                                                      */
/* -------------------------------------------------------------------------- */

export function move<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item as T);
  return next;
}

export function RowActions({
  index,
  total,
  onMove,
  onRemove,
  removeTitle,
  removeDescription,
}: {
  index: number;
  total: number;
  onMove: (delta: number) => void;
  onRemove: () => void;
  removeTitle?: string;
  removeDescription?: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Mover para cima"
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Mover para baixo"
        disabled={index === total - 1}
        onClick={() => onMove(1)}
      >
        <ArrowDown className="size-4" />
      </Button>
      <ConfirmDelete
        onConfirm={onRemove}
        {...(removeTitle ? { title: removeTitle } : {})}
        {...(removeDescription ? { description: removeDescription } : {})}
      />
    </div>
  );
}

/** Lista de textos simples (um item por linha), com adicionar/remover/reordenar. */
export function StringListEditor({
  label,
  hint,
  items,
  onChange,
  placeholder = "Novo item",
  addLabel = "+ ADICIONAR ITEM",
  multiline,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
          Nenhum item cadastrado.
        </p>
      ) : null}

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            {multiline ? (
              <Textarea
                rows={2}
                aria-label={`${label} — item ${index + 1}`}
                value={item}
                placeholder={placeholder}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = e.target.value;
                  onChange(next);
                }}
              />
            ) : (
              <Input
                aria-label={`${label} — item ${index + 1}`}
                value={item}
                placeholder={placeholder}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = e.target.value;
                  onChange(next);
                }}
              />
            )}
            <RowActions
              index={index}
              total={items.length}
              onMove={(delta) => onChange(move(items, index, delta))}
              onRemove={() => onChange(items.filter((_, i) => i !== index))}
              removeTitle="Excluir item?"
            />
          </li>
        ))}
      </ul>

      <Button type="button" variant="quiet" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus className="size-4" /> {addLabel}
      </Button>
    </div>
  );
}

/** Repetidor genérico: cabeçalho + ações e conteúdo livre por item. */
export function Repeater<T>({
  items,
  onChange,
  makeItem,
  addLabel,
  emptyLabel = "Nenhum item cadastrado.",
  titleOf,
  removeTitle,
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeItem: () => T;
  addLabel: string;
  emptyLabel?: string;
  titleOf: (item: T, index: number) => string;
  removeTitle?: string;
  children: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
}) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : null}

      {items.map((item, index) => (
        <div key={index} className="rounded-md border border-border/60 bg-background/40 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <p className="min-w-0 truncate text-overline">{titleOf(item, index)}</p>
            <RowActions
              index={index}
              total={items.length}
              onMove={(delta) => onChange(move(items, index, delta))}
              onRemove={() => onChange(items.filter((_, i) => i !== index))}
              {...(removeTitle ? { removeTitle } : {})}
            />
          </div>
          <div className="space-y-4">
            {children(
              item,
              (patch) => {
                const next = [...items];
                next[index] = { ...(item as object), ...patch } as T;
                onChange(next);
              },
              index,
            )}
          </div>
        </div>
      ))}

      <Button type="button" variant="quiet" size="sm" onClick={() => onChange([...items, makeItem()])}>
        <Plus className="size-4" /> {addLabel}
      </Button>
    </div>
  );
}

export type FaqItem = { q: string; a: string; active?: boolean };

/** Editor visual do FAQ (sem JSON). */
export function FaqEditor({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}) {
  return (
    <Repeater<FaqItem>
      items={items}
      onChange={onChange}
      makeItem={() => ({ q: "", a: "", active: true })}
      addLabel="+ ADICIONAR PERGUNTA"
      emptyLabel="Nenhuma pergunta cadastrada."
      removeTitle="Excluir pergunta?"
      titleOf={(item, index) => item.q?.trim() || `Pergunta ${index + 1}`}
    >
      {(item, update) => (
        <>
          <TextField
            label="Pergunta"
            value={item.q ?? ""}
            onChange={(value) => update({ q: value } as Partial<FaqItem>)}
          />
          <TextField
            label="Resposta"
            rows={3}
            value={item.a ?? ""}
            onChange={(value) => update({ a: value } as Partial<FaqItem>)}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 accent-[var(--color-primary)]"
              checked={item.active !== false}
              onChange={(e) => update({ active: e.target.checked } as Partial<FaqItem>)}
            />
            Exibir esta pergunta na página
          </label>
        </>
      )}
    </Repeater>
  );
}

/* -------------------------------------------------------------------------- */
/* Imagem                                                                      */
/* -------------------------------------------------------------------------- */

export function ImageField({
  label,
  hint,
  value,
  onChange,
  folder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  folder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useMediaUrl(value);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const ref = await uploadImage(file, folder);
      onChange(ref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background/60">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Pré-visualização — ${label}`}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <ImageOff className="size-5 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="min-w-0 space-y-2">
          {!value ? (
            <p className="text-xs text-muted-foreground">
              Adicione uma imagem para substituir o visual padrão.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="quiet"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {value ? "SUBSTITUIR" : "ENVIAR IMAGEM"}
            </Button>
            {value ? (
              <ConfirmDelete
                title="Remover imagem?"
                description="A página volta a usar o visual padrão."
                onConfirm={() => {
                  void removeImage(value);
                  onChange("");
                }}
                trigger={
                  <Button type="button" variant="ghost" size="sm">
                    REMOVER
                  </Button>
                }
              />
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="sr-only"
            aria-label={`Enviar arquivo — ${label}`}
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, AVIF ou SVG · até 5 MB.</p>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>

      <TextField
        label="Ou informe uma URL de imagem"
        value={value.startsWith("media://") ? "" : value}
        placeholder="https://..."
        onChange={(v) => onChange(v)}
        hint="Use apenas se a imagem já estiver hospedada em outro lugar."
      />
    </div>
  );
}

export function PreviewLink({ to, label }: { to: string; label: string }) {
  return (
    <Button asChild variant="quiet" size="sm">
      <a href={to} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="size-4" /> {label}
      </a>
    </Button>
  );
}
