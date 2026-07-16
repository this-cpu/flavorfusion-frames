import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, ChefHat, LayoutDashboard, PlusCircle, Shield, ShoppingCart, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Item = { to: string; label: string; icon: LucideIcon };

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin, isChef } = useAuth();

  const items: Item[] = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/recipes/add", label: "Add recipe", icon: PlusCircle },
    { to: "/recipes", label: "Browse recipes", icon: BookOpen },
    { to: "/shopping-list", label: "Shopping list", icon: ShoppingCart },
    { to: "/profile", label: "Profile", icon: User },
  ];
  if (isAdmin) items.push({ to: "/admin", label: "Admin", icon: Shield });

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-4">
        <div className="flex items-center gap-2 px-2 pb-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <ChefHat className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">
            {isAdmin ? "Admin panel" : isChef ? "Chef kitchen" : "My kitchen"}
          </span>
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
      </div>
    </aside>
  );
}
