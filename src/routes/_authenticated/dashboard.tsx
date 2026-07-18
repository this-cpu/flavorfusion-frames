import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Heart, MessageSquare, PlusCircle, Sparkles, TrendingUp, Users } from "lucide-react";
import { DashboardLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { PLACEHOLDER_IMG } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, primaryRole, isAdmin, isChef } = useAuth();

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [myRecipesRes, myCommentsRes, myLikesRes, allRecipesForAdminRes] = await Promise.all([
        supabase.from("recipes").select("*").eq("author_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("comments").select("id, body, created_at, recipe_id, recipes(title, author_id)").order("created_at", { ascending: false }).limit(10),
        supabase.from("likes").select("recipe_id, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }),
        isAdmin ? supabase.from("recipes").select("*", { count: "exact", head: true }) : Promise.resolve({ count: 0 } as any),
      ]);

      const myRecipeIds = new Set((myRecipesRes.data ?? []).map((r) => r.id));
      const { data: likesOnMine } = await supabase
        .from("likes")
        .select("recipe_id")
        .in("recipe_id", Array.from(myRecipeIds).length ? Array.from(myRecipeIds) : ["00000000-0000-0000-0000-000000000000"]);

      const commentsOnMine = (myCommentsRes.data ?? []).filter(
        (c: any) => c.recipes?.author_id === user!.id,
      );

      const likedIds = (myLikesRes.data ?? []).map((l: any) => l.recipe_id);
      const likedRecipes = likedIds.length
        ? ((await supabase
            .from("recipes")
            .select("id, title, image_url, difficulty, created_at")
            .in("id", likedIds)).data ?? [])
        : [];
      // preserve like order
      const orderMap = new Map(likedIds.map((id, i) => [id, i]));
      likedRecipes.sort((a: any, b: any) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

      return {
        myRecipes: myRecipesRes.data ?? [],
        likesOnMineCount: likesOnMine?.length ?? 0,
        commentsOnMine,
        likedRecipes,
        totalRecipesGlobal: (allRecipesForAdminRes as any).count ?? 0,
      };
    },
  });


  const stats = [
    { label: "Your recipes", value: `${data?.myRecipes.length ?? 0}`, icon: BookOpen },
    { label: "Likes received", value: `${data?.likesOnMineCount ?? 0}`, icon: Heart },
    { label: "Comments received", value: `${data?.commentsOnMine.length ?? 0}`, icon: MessageSquare },
    { label: isAdmin ? "Total site recipes" : isChef ? "Chef status" : "Cook status", value: isAdmin ? `${data?.totalRecipesGlobal ?? 0}` : "Active", icon: TrendingUp },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Welcome, {profile?.display_name ?? "friend"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isAdmin
              ? "You have full admin access — moderate content and manage users."
              : isChef
                ? "Chef mode is on. Share your best recipes with the community."
                : "Home-cook mode. Save your favorites and share what you cook."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {primaryRole && (
            <Badge variant="secondary" className="capitalize">
              {primaryRole === "homecook" ? "Home cook" : primaryRole}
            </Badge>
          )}
          <Link to="/recipes/add">
            <Button className="rounded-full">
              <PlusCircle className="mr-2 h-4 w-4" /> New recipe
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="h-4 w-4" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="font-display text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="font-medium">Admin tools</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage every user and recipe on Saveur.
          </p>
          <div className="mt-3 flex gap-2">
            <Link to="/admin"><Button size="sm">Open admin panel</Button></Link>
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-display text-xl font-semibold">Your recipes</h2>
            <Link to="/recipes/add" className="text-sm text-primary hover:underline">Add new</Link>
          </div>
          <ul className="divide-y">
            {(data?.myRecipes ?? []).length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">
                No recipes yet. <Link to="/recipes/add" className="text-primary underline">Create your first</Link>.
              </li>
            )}
            {(data?.myRecipes ?? []).map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-6 py-4">
                <img src={r.image_url || PLACEHOLDER_IMG} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/recipes/$id" params={{ id: r.id }} className="truncate font-medium hover:underline">
                    {r.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {r.difficulty} · {formatDistanceToNow(new Date(r.created_at))} ago
                  </p>
                </div>
                <Badge variant={r.is_published ? "secondary" : "outline"}>
                  {r.is_published ? "Published" : "Draft"}
                </Badge>
                <Link to="/recipes/edit/$id" params={{ id: r.id }}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-display text-xl font-semibold">Recent activity</h2>
          </div>
          <ul className="mt-4 space-y-4">
            {(data?.commentsOnMine ?? []).length === 0 && (
              <li className="text-sm text-muted-foreground">No comments on your recipes yet.</li>
            )}
            {(data?.commentsOnMine ?? []).map((c: any) => (
              <li key={c.id} className="flex gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Comment on</span>{" "}
                    <Link to="/recipes/$id" params={{ id: c.recipe_id }} className="text-muted-foreground hover:underline">
                      {c.recipes?.title}
                    </Link>
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
