import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChefHat, LogOut, Menu, Search, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/recipes", label: "Recipes" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user, profile, primaryRole, isAdmin, isChef, isHomecook, signOut } = useAuth();
  const canPublish = isAdmin || isChef || isHomecook;

  const initials = (profile?.display_name || user?.email || "U").slice(0, 2).toUpperCase();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/recipes", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-strong border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-primary to-primary-glow text-primary-foreground shadow-warm">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Saveur</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <form onSubmit={submitSearch} className="hidden md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search recipes..."
                  className="h-9 w-56 rounded-full pl-9"
                />
              </div>
            </form>
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{profile?.display_name ?? "Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="truncate">{user.email}</span>
                    {primaryRole && (
                      <Badge variant="secondary" className="ml-2 capitalize">
                        {primaryRole}
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                    Profile
                  </DropdownMenuItem>
                  {canPublish ? (
                    <DropdownMenuItem onClick={() => navigate({ to: "/recipes/add" })}>
                      Add recipe
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate({ to: "/apply" })}>
                      Apply as chef / cook
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/", replace: true });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth" search={{ mode: "signin" } as never} className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth" search={{ mode: "signup" } as never} className="hidden sm:inline-flex">
                  <Button size="sm" className="rounded-full">
                    Get started
                  </Button>
                </Link>
                <Link to="/auth" className="sm:hidden">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-8 flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2 text-base hover:bg-accent"
                    >
                      {l.label}
                    </Link>
                  ))}
                  {!user && (
                    <>
                      <div className="my-3 h-px bg-border" />
                      <Link to="/auth" onClick={() => setOpen(false)}>
                        <Button className="w-full">Sign in / Register</Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
