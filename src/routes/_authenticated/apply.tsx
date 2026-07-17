import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Award, ChefHat, ClipboardCheck, Upload, UtensilsCrossed } from "lucide-react";
import { DashboardLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/apply")({
  component: ApplyPage,
});

function ApplyPage() {
  const { user, isPending, isChef, isHomecook, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"chef" | "homecook">("chef");

  // Chef form
  const [chefNote, setChefNote] = useState("");
  const [chefFile, setChefFile] = useState<File | null>(null);

  // Homecook form
  const [rcpTitle, setRcpTitle] = useState("");
  const [rcpIngredients, setRcpIngredients] = useState("");
  const [rcpSteps, setRcpSteps] = useState("");
  const [rcpNote, setRcpNote] = useState("");

  const { data: apps = [] } = useQuery({
    queryKey: ["my-applications", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase
        .from("role_applications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })).data ?? [],
  });

  const applyChef = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      if (!chefFile) throw new Error("Please upload a certificate or credential photo");
      const ext = chefFile.name.split(".").pop() ?? "bin";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("role-evidence").upload(path, chefFile);
      if (upErr) throw upErr;
      const { error } = await supabase.from("role_applications").insert({
        user_id: user.id,
        requested_role: "chef",
        evidence_url: path,
        note: chefNote || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted!");
      setChefNote("");
      setChefFile(null);
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const applyHomecook = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      if (!rcpTitle.trim() || !rcpIngredients.trim() || !rcpSteps.trim()) {
        throw new Error("Please fill title, ingredients and steps");
      }
      const evidence = {
        title: rcpTitle.trim(),
        ingredients: rcpIngredients.split("\n").map((s) => s.trim()).filter(Boolean),
        steps: rcpSteps.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      const { error } = await supabase.from("role_applications").insert({
        user_id: user.id,
        requested_role: "homecook",
        evidence_url: null,
        note: `${rcpNote}\n\n---SAMPLE RECIPE---\n${JSON.stringify(evidence, null, 2)}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recipe submitted for review!");
      setRcpTitle("");
      setRcpIngredients("");
      setRcpSteps("");
      setRcpNote("");
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const hasPending = apps.some((a: any) => a.status === "pending");

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-display text-3xl font-semibold">Become a contributor</h1>
        <p className="mt-1 text-muted-foreground">
          Apply to publish recipes as a chef or home cook. Approved by our admin team.
        </p>
      </div>

      {(isChef || isHomecook || isAdmin) && (
        <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/5 p-5">
          <p className="text-sm">
            You're already a{" "}
            <b>{isAdmin ? "admin" : isChef ? "chef" : "home cook"}</b>. You can still submit
            additional applications if you want another role.
          </p>
        </div>
      )}

      {!isPending && !isChef && !isHomecook && !isAdmin && (
        <div className="mt-6 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
          Loading your account status…
        </div>
      )}

      {/* Application tabs */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => setTab("chef")}
          className={`rounded-2xl border p-6 text-left transition-all ${
            tab === "chef" ? "border-primary bg-primary/5 shadow-warm" : "hover:border-primary/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold">Apply as Chef</p>
              <p className="text-xs text-muted-foreground">Upload a certificate or credential.</p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setTab("homecook")}
          className={`rounded-2xl border p-6 text-left transition-all ${
            tab === "homecook" ? "border-primary bg-primary/5 shadow-warm" : "hover:border-primary/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold">Apply as Home Cook</p>
              <p className="text-xs text-muted-foreground">Submit a sample recipe as proof.</p>
            </div>
          </div>
        </button>
      </div>

      {/* Forms */}
      <div className="mt-6 rounded-2xl border bg-card p-6">
        {tab === "chef" ? (
          <>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="font-display text-xl font-semibold">Chef application</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a photo/PDF of your culinary certificate, diploma or professional badge.
            </p>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cert">Certificate (image or PDF)</Label>
                <Input
                  id="cert"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setChefFile(e.target.files?.[0] ?? null)}
                />
                {chefFile && (
                  <p className="text-xs text-muted-foreground">
                    <Upload className="mr-1 inline h-3 w-3" />
                    {chefFile.name} ({Math.round(chefFile.size / 1024)} KB)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnote">A little about you (optional)</Label>
                <Textarea
                  id="cnote"
                  value={chefNote}
                  onChange={(e) => setChefNote(e.target.value)}
                  placeholder="Where you trained, cuisines you specialize in, restaurants worked at..."
                  rows={4}
                  maxLength={2000}
                />
              </div>
              <Button
                className="rounded-full"
                onClick={() => applyChef.mutate()}
                disabled={applyChef.isPending || hasPending}
              >
                {applyChef.isPending ? "Submitting..." : "Submit application"}
              </Button>
              {hasPending && (
                <p className="text-xs text-muted-foreground">
                  You already have a pending application. Please wait for review.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              <h2 className="font-display text-xl font-semibold">Home cook application</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Submit one of your favorite recipes — we'll review it to confirm you're a real cook.
            </p>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rt">Recipe title</Label>
                <Input id="rt" value={rcpTitle} onChange={(e) => setRcpTitle(e.target.value)} placeholder="Grandma's Sunday roast" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ri">Ingredients (one per line)</Label>
                <Textarea
                  id="ri"
                  rows={6}
                  value={rcpIngredients}
                  onChange={(e) => setRcpIngredients(e.target.value)}
                  placeholder={"1 tbsp olive oil\n2 cloves garlic..."}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rs">Steps (one per line)</Label>
                <Textarea
                  id="rs"
                  rows={6}
                  value={rcpSteps}
                  onChange={(e) => setRcpSteps(e.target.value)}
                  placeholder={"Preheat oven to 200°C.\nSeason the meat..."}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rn">Note to reviewer (optional)</Label>
                <Textarea id="rn" rows={3} value={rcpNote} onChange={(e) => setRcpNote(e.target.value)} />
              </div>
              <Button
                className="rounded-full"
                onClick={() => applyHomecook.mutate()}
                disabled={applyHomecook.isPending || hasPending}
              >
                {applyHomecook.isPending ? "Submitting..." : "Submit application"}
              </Button>
              {hasPending && (
                <p className="text-xs text-muted-foreground">
                  You already have a pending application. Please wait for review.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* History */}
      <div className="mt-10 rounded-2xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-display text-xl font-semibold">Your applications</h2>
        </div>
        {apps.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <ul className="divide-y">
            {apps.map((a: any) => (
              <li key={a.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize">
                    Apply as {a.requested_role === "homecook" ? "home cook" : a.requested_role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(a.created_at))} ago
                    {a.review_notes ? ` · Reviewer note: ${a.review_notes}` : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    a.status === "approved" ? "default" : a.status === "rejected" ? "destructive" : "secondary"
                  }
                  className="capitalize"
                >
                  {a.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        Not ready to apply? <Link to="/recipes" className="text-primary underline">Keep browsing recipes</Link>.
      </div>
    </DashboardLayout>
  );
}
