import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, Trash2, ShoppingCart, Download } from "lucide-react";
import { DashboardLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useShoppingList } from "@/lib/shopping-list";
import { toast } from "sonner";
import { useMemo } from "react";
import { parseIngredientLine, sumNutrition, round } from "@/lib/ingredients";
import { NutritionCard } from "@/components/NutritionBreakdown";

export const Route = createFileRoute("/_authenticated/shopping-list")({
  component: ShoppingListPage,
});


function ShoppingListPage() {
  const { items, toggle, remove, clear, clearChecked } = useShoppingList();
  const total = items.length;
  const done = items.filter((i) => i.checked).length;

  const download = () => {
    const text = items.map((i) => `${i.checked ? "[x]" : "[ ]"} ${i.text}`).join("\n");
    const blob = new Blob([text || "(empty)"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping-list.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded shopping-list.txt");
  };

  // Group by recipe
  const groups = new Map<string, typeof items>();
  items.forEach((i) => {
    const k = i.recipe_title ?? "Other";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(i);
  });

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Shopping list</h1>
          <p className="mt-1 text-muted-foreground">
            {done}/{total} items checked · stored locally on this device
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={download}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button variant="outline" onClick={clearChecked} disabled={done === 0}>
            Clear checked
          </Button>
          <Button variant="destructive" onClick={clear} disabled={total === 0}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear all
          </Button>
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed p-12 text-center">
          <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your shopping list is empty.</p>
          <Link to="/recipes" className="mt-4 inline-block">
            <Button className="rounded-full">Browse recipes</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6 print:mt-4">
          {Array.from(groups.entries()).map(([title, list]) => (
            <div key={title} className="rounded-2xl border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">{title}</h2>
              <ul className="mt-4 space-y-2">
                {list.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent/40">
                    <Checkbox checked={i.checked} onCheckedChange={() => toggle(i.id)} />
                    <span className={`flex-1 text-sm ${i.checked ? "text-muted-foreground line-through" : ""}`}>
                      {i.text}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => remove(i.id)} className="print:hidden">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
