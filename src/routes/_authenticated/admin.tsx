import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MoreHorizontal, ShieldAlert, Trash2, Users, Utensils, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/Layouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { PLACEHOLDER_IMG } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }: any) => {
    const uid = context.user?.id;
    if (!uid) throw redirect({ to: "/auth", search: { mode: "signin" } });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: Admin,
});

function Admin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-data"],
    enabled: isAdmin,
    queryFn: async () => {
      const [profilesRes, recipesRes, commentsRes, rolesRes, appsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("recipes").select("*, profiles!recipes_author_id_fkey(display_name)").order("created_at", { ascending: false }),
        supabase.from("comments").select("*, profiles!comments_user_id_fkey(display_name), recipes(title)").order("created_at", { ascending: false }).limit(20),
        supabase.from("user_roles").select("*"),
        supabase.from("role_applications").select("*, profiles!role_applications_user_id_fkey(display_name, username, avatar_url)").order("created_at", { ascending: false }),
      ]);
      const rolesByUser = new Map<string, string[]>();
      (rolesRes.data ?? []).forEach((r: any) => {
        rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role]);
      });
      return {
        profiles: (profilesRes.data ?? []).map((p) => ({ ...p, roles: rolesByUser.get(p.id) ?? [] })),
        recipes: recipesRes.data ?? [],
        comments: commentsRes.data ?? [],
        applications: appsRes.data ?? [],
      };
    },
  });

  const reviewApp = useMutation({
    mutationFn: async ({ id, userId, role, approve, note }: { id: string; userId: string; role: string; approve: boolean; note?: string }) => {
      const { error: uerr } = await supabase
        .from("role_applications")
        .update({ status: approve ? "approved" : "rejected", review_notes: note ?? null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (uerr) throw uerr;
      if (approve) {
        // grant role (upsert avoids duplicate errors)
        const { error: rerr } = await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: role as any }, { onConflict: "user_id,role" });
        if (rerr) throw rerr;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.approve ? "Application approved" : "Application rejected");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recipe deleted");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comment removed");
      qc.invalidateQueries();
    },
  });

  const kpis = [
    { label: "Total users", value: `${data?.profiles.length ?? 0}`, icon: Users, tone: "primary" },
    { label: "Recipes", value: `${data?.recipes.length ?? 0}`, icon: Utensils, tone: "primary" },
    { label: "Comments", value: `${data?.comments.length ?? 0}`, icon: MoreHorizontal, tone: "primary" },
    { label: "Admins", value: `${data?.profiles.filter((p: any) => p.roles.includes("admin")).length ?? 0}`, icon: ShieldAlert, tone: "warn" },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage users, moderate content, keep the kitchen tidy.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border bg-card p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-lg ${
              k.tone === "warn" ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"
            }`}>
              <k.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="font-display text-3xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card lg:col-span-2">
          <div className="border-b px-6 py-4">
            <h2 className="font-display text-xl font-semibold">All recipes</h2>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            <ul className="divide-y">
              {(data?.recipes ?? []).map((r: any) => (
                <li key={r.id} className="flex items-center gap-3 p-4">
                  <img src={r.image_url || PLACEHOLDER_IMG} className="h-12 w-12 rounded-lg object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <Link to="/recipes/$id" params={{ id: r.id }} className="truncate text-sm font-medium hover:underline">
                      {r.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      by {r.profiles?.display_name ?? "unknown"} · {formatDistanceToNow(new Date(r.created_at))} ago
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteRecipe.mutate(r.id)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="font-display text-xl font-semibold">Recent comments</h2>
          </div>
          <ul className="max-h-[520px] divide-y overflow-y-auto">
            {(data?.comments ?? []).map((c: any) => (
              <li key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {c.profiles?.display_name ?? "user"} on <span className="text-foreground">{c.recipes?.title ?? "recipe"}</span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm">{c.body}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteComment.mutate(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-display text-xl font-semibold">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Roles</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(data?.profiles ?? []).map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-6 py-3">
                    <p className="font-medium">{p.display_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">@{p.username ?? "—"}</p>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(p.roles ?? []).length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      {(p.roles ?? []).map((r: string) => (
                        <Badge key={r} variant="secondary" className="capitalize">
                          {r === "homecook" ? "Home cook" : r}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(p.created_at))} ago
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-display text-xl font-semibold">Role applications</h2>
          <Badge variant="secondary">
            {(data?.applications ?? []).filter((a: any) => a.status === "pending").length} pending
          </Badge>
        </div>
        {(data?.applications ?? []).length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <ul className="divide-y">
            {(data?.applications ?? []).map((a: any) => (
              <li key={a.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {a.profiles?.display_name ?? "user"} → wants to become{" "}
                      <span className="capitalize">{a.requested_role === "homecook" ? "home cook" : a.requested_role}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {formatDistanceToNow(new Date(a.created_at))} ago
                    </p>
                    {a.note && (
                      <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-xs">
                        {a.note}
                      </pre>
                    )}
                    {a.evidence_url && (
                      <p className="mt-2 text-xs">
                        Evidence file:{" "}
                        <code className="rounded bg-muted px-1.5 py-0.5">{a.evidence_url}</code>
                        <span className="ml-1 text-muted-foreground">(role-evidence bucket)</span>
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      a.status === "approved" ? "default" : a.status === "rejected" ? "destructive" : "secondary"
                    }
                    className="capitalize"
                  >
                    {a.status}
                  </Badge>
                </div>
                {a.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        reviewApp.mutate({ id: a.id, userId: a.user_id, role: a.requested_role, approve: true })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const note = window.prompt("Reason for rejection (optional):") ?? undefined;
                        reviewApp.mutate({ id: a.id, userId: a.user_id, role: a.requested_role, approve: false, note });
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        Approving a role grants the user contributor access instantly.
      </div>
    </DashboardLayout>
  );
}
