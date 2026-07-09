import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ChefHat,
  Heart,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Shield,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const items: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/recipes/add", label: "Add recipe", icon: PlusCircle },
  { to: "/recipes", label: "My recipes", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/categories", label: "Favorites", icon: Heart },
  { to: "/admin", label: "Admin", icon: Shield },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
        <div className="flex items-center gap-2 px-2 pb-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <ChefHat className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">Kitchen</span>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" /> Pro tip
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Add cover photos to your recipes to get 3× more views.
          </p>
        </div>
      </div>
    </aside>
  );
}
