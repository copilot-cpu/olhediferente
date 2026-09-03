import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Container } from "@/components/ds/container";
import { IrisGlow, IrisMark } from "@/components/ds/iris";
import { ErrorState } from "@/components/ds/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const title = "Acesso administrativo — OLHE DIFERENTE";
const description = "Área restrita de administração do sistema OLHE DIFERENTE.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      navigate({ to: "/admin", replace: true });
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      setNotice("Conta criada. Confirme o e-mail enviado para concluir o acesso.");
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden">
      <IrisGlow />
      <Container width="narrow" className="relative">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <IrisMark size={110} />
          <h1 className="text-title text-foreground">Área administrativa</h1>
        </div>

        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardContent className="p-6 sm:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error ? <ErrorState title="Não foi possível entrar" description={error} /> : null}
              {notice ? <p className="text-sm text-primary">{notice}</p> : null}

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar acesso"}
              </Button>
            </form>

            <button
              type="button"
              className="mt-5 w-full cursor-pointer text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
            >
              {mode === "signin" ? "Criar primeiro acesso" : "Já tenho acesso"}
            </button>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
