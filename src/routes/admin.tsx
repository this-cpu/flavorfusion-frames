import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Flag, MoreHorizontal, ShieldAlert, Users, Utensils, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/Layouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recipes } from "@/lib/dummy-data";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

const kpis = [
  { label: "Total users", value: "8,432", icon: Users, tone: "primary" },
  { label: "Recipes", value: "1,204", icon: Utensils, tone: "primary" },
  { label: "Pending review", value: "12", icon: Flag, tone: "warn" },
  { label: "Reports", value: "3", icon: ShieldAlert, tone: "danger" },
];

const users = [
  { name: "Sofia Reyes", email: "sofia@saveur.app", role: "Chef", status: "Active" },
  { name: "Marco Bianchi", email: "marco@saveur.app", role: "Home cook", status: "Active" },
  { name: "Ploy Suwan", email: "ploy@saveur.app", role: "Chef", status: "Suspended" },
  { name: "Elena Rossi", email: "elena@saveur.app", role: "Home cook", status: "Active" },
];

function Admin() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage users, moderate content, and keep the kitchen tidy.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border bg-card p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-lg ${
              k.tone === "warn"
                ? "bg-amber-500/15 text-amber-600"
                : k.tone === "danger"
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/10 text-primary"
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
            <h2 className="font-display text-xl font-semibold">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className="border-t">
                    <td className="px-6 py-3">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-6 py-3">{u.role}</td>
                    <td className="px-6 py-3">
                      <Badge variant={u.status === "Active" ? "secondary" : "destructive"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="font-display text-xl font-semibold">Moderation queue</h2>
          </div>
          <ul className="divide-y">
            {recipes.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-4">
                <img src={r.image} className="h-12 w-12 rounded-lg object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">by {r.author}</p>
                </div>
                <Button size="icon" variant="ghost" className="text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive">
                  <XCircle className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
