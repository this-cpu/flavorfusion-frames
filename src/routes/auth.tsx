import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChefHat, ShieldCheck, User as UserIcon, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AppRole } from "@/lib/types";

type Search = { mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "signup" ? "signup" : s.mode === "signin" ? "signin" : undefined,
  }),
  component: AuthPage,
});

const DEMO_ACCOUNTS = [
  { role: "admin", label: "Admin", email: "admin@saveur.dev", password: "admin1234", icon: ShieldCheck, tint: "text-red-500" },
  { role: "chef", label: "Chef", email: "chef@saveur.dev", password: "chef1234", icon: UtensilsCrossed, tint: "text-orange-500" },
  { role: "homecook", label: "Home cook", email: "homecook@saveur.dev", password: "homecook1234", icon: UserIcon, tint: "text-emerald-600" },
] as const;

function AuthPage() {
  const { mode } = Route.useSearch();
  const { session, refresh } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Exclude<AppRole, "admin">>("homecook");

  useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  const doSignIn = async (em: string, pw: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    await refresh();
    navigate({ to: "/dashboard", replace: true });
  };

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    doSignIn(email, password);
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: displayName || email.split("@")[0], role },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! You're signed in.");
  };

  return (
    <div className="bg-hero grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-primary to-primary-glow text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="font-display text-xl">Saveur</span>
          </Link>

          <Tabs defaultValue={mode === "signup" ? "signup" : "signin"}>
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="signin" className="rounded-full">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to your kitchen.</p>

              <div className="mt-6 rounded-2xl border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Demo accounts (one-click sign-in)
                </p>
                <div className="mt-3 grid gap-2">
                  {DEMO_ACCOUNTS.map((a) => (
                    <button
                      key={a.role}
                      type="button"
                      disabled={loading}
                      onClick={() => doSignIn(a.email, a.password)}
                      className="group flex items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:border-primary hover:bg-accent/40 disabled:opacity-60"
                    >
                      <div className={`grid h-9 w-9 place-items-center rounded-lg bg-muted ${a.tint}`}>
                        <a.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.label}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.email} · {a.password}
                        </p>
                      </div>
                      <span className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Sign in →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={signIn} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="e1">Email</Label>
                  <Input id="e1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p1">Password</Label>
                  <Input id="p1" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <h1 className="font-display text-3xl font-semibold">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Join thousands sharing what they cook.</p>
              <form onSubmit={signUp} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dn">Display name</Label>
                  <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Aria Bennett" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e2">Email</Label>
                  <Input id="e2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p2">Password</Label>
                  <Input id="p2" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
                </div>
                <div className="space-y-2">
                  <Label>I'm a...</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as "chef" | "homecook")} className="grid grid-cols-2 gap-2">
                    <label className={`cursor-pointer rounded-xl border p-3 ${role === "homecook" ? "border-primary bg-primary/5" : ""}`}>
                      <RadioGroupItem value="homecook" className="sr-only" />
                      <p className="font-medium">🏠 Home cook</p>
                      <p className="text-xs text-muted-foreground">Cooking for family & friends</p>
                    </label>
                    <label className={`cursor-pointer rounded-xl border p-3 ${role === "chef" ? "border-primary bg-primary/5" : ""}`}>
                      <RadioGroupItem value="chef" className="sr-only" />
                      <p className="font-medium">👨‍🍳 Chef</p>
                      <p className="text-xs text-muted-foreground">Professional or aspiring</p>
                    </label>
                  </RadioGroup>
                </div>
                <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
                  {loading ? "Creating..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-linear-to-br from-primary to-primary-glow p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=70"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Everything you need to cook with confidence.
          </h2>
          <ul className="mt-8 space-y-3 text-lg">
            <li>• Save unlimited recipes</li>
            <li>• Comment and like the community's best</li>
            <li>• Publish your own creations</li>
            <li>• Role-based tools for chefs, home cooks, and admins</li>
          </ul>
        </div>
        <p className="relative text-sm opacity-80">© Saveur — an interactive recipe book.</p>
      </div>
    </div>
  );
}
