import { cn } from "@/lib/utils";

/**
 * Exibe textos administráveis preservando a formatação digitada no painel:
 * linhas em branco viram parágrafos, quebras simples viram novas linhas.
 */
export function RichText({
  text,
  className,
  as: Tag = "p",
}: {
  text: string | null | undefined;
  className?: string;
  as?: "p" | "div" | "span";
}) {
  const value = (text ?? "").replace(/\r\n/g, "\n").trim();
  if (!value) return null;

  const paragraphs = value.split(/\n{2,}/);
  if (paragraphs.length === 1) {
    return <Tag className={cn("whitespace-pre-line", className)}>{value}</Tag>;
  }

  return (
    <div className={cn("space-y-4", className && "contents")}>
      {paragraphs.map((paragraph, index) => (
        <Tag key={`${index}-${paragraph.slice(0, 12)}`} className={cn("whitespace-pre-line", className)}>
          {paragraph}
        </Tag>
      ))}
    </div>
  );
}
