import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sprout,
  PlayCircle,
  Gift,
  FlaskConical,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { GoldRule } from "@/components/ds/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/captacao", label: "Captação", icon: Sprout, exact: false },
  { to: "/admin/webinar", label: "Webinar", icon: PlayCircle, exact: false },
  { to: "/admin/oferta", label: "Oferta", icon: Gift, exact: false },
  { to: "/admin/simulacao", label: "Simulação", icon: FlaskConical, exact: false },
  { to: "/admin/leads", label: "Leads", icon: Users, exact: false },
  { to: "/admin/usuarios", label: "Usuários", icon: UserCog, exact: false },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings, exact: false },
] as const;

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.exact }}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-primary"
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <SidebarBrand />
        <GoldRule className="my-5" />
        {nav}
        <div className="mt-auto pt-6">
          <Button variant="quiet" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border/60 px-5 py-4 lg:px-10">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
          <div className="min-w-0">
            <h1 className="text-heading truncate text-foreground">{title}</h1>
            {description ? (
              <p className="truncate text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </header>

        {open ? (
          <div className="border-b border-sidebar-border bg-sidebar p-4 lg:hidden">
            {nav}
            <Button variant="quiet" size="sm" className="mt-4 w-full" onClick={signOut}>
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        ) : null}

        <main className={cn("flex-1 px-5 py-8 lg:px-10")}>{children}</main>
      </div>
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3">
      <div className="iris-field size-9 ring-1 ring-primary/30" aria-hidden />
      <div className="leading-tight">
        <p className="font-display text-sm uppercase tracking-[0.18em] text-primary">
          Olhe Diferente
        </p>
        <p className="text-[0.7rem] text-muted-foreground">Painel administrativo</p>
      </div>
    </div>
  );
}
