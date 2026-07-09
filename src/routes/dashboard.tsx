import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Eye,
  Heart,
  MoreHorizontal,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { recipes } from "@/lib/dummy-data";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const stats = [
  { label: "Recipes", value: "24", trend: "+3", icon: BookOpen },
  { label: "Total views", value: "12.4k", trend: "+18%", icon: Eye },
  { label: "Favorites", value: "1,842", trend: "+124", icon: Heart },
  { label: "Followers", value: "348", trend: "+22", icon: TrendingUp },
];

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Welcome back, Aria 👋</h1>
          <p className="mt-1 text-muted-foreground">Here's what's cooking in your kitchen this week.</p>
        </div>
        <Link to="/recipes/add">
          <Button className="rounded-full">
            <PlusCircle className="mr-2 h-4 w-4" /> New recipe
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <Badge variant="secondary" className="rounded-full text-xs">{s.trend}</Badge>
            </div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="font-display text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="font-display text-xl font-semibold">Your recipes</h2>
            <Link to="/recipes" className="text-sm text-primary hover:underline">See all</Link>
          </div>
          <ul className="divide-y">
            {recipes.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-6 py-4">
                <img src={r.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.category} · {r.time}
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">Published</Badge>
                <Link to="/recipes/edit/$id" params={{ id: r.id }}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Activity</h2>
          <ul className="mt-4 space-y-4">
            {[
              { who: "Sofia liked", what: "Creamy Tuscan Chicken", when: "2h ago" },
              { who: "New follower", what: "@marco_b", when: "4h ago" },
              { who: "Comment on", what: "Matcha Berry Pancakes", when: "1d ago" },
              { who: "Kai saved", what: "Thai Green Curry", when: "2d ago" },
            ].map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
