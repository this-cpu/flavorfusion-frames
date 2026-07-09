import { createFileRoute } from "@tanstack/react-router";
import { Camera, MapPin, Mail, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RecipeCard } from "@/components/RecipeCard";
import { recipes } from "@/lib/dummy-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const mine = recipes.slice(0, 3);
  const saved = recipes.slice(3, 6);

  return (
    <SiteLayout>
      <div className="relative h-56 w-full overflow-hidden bg-linear-to-br from-primary to-primary-glow">
        <img
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1600&q=70"
          alt=""
          className="h-full w-full object-cover opacity-60"
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="-mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative">
              <img
                src="https://i.pravatar.cc/200?img=32"
                alt=""
                className="h-32 w-32 rounded-2xl border-4 border-background object-cover shadow-warm"
              />
              <button className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-background text-foreground shadow">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="pb-2">
              <h1 className="font-display text-3xl font-semibold">Aria Bennett</h1>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Lisbon, Portugal</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined Mar 2024</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full">Share profile</Button>
            <Button className="rounded-full">Edit profile</Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border bg-card p-4 text-center">
          <div><p className="font-display text-2xl font-semibold">24</p><p className="text-xs text-muted-foreground">Recipes</p></div>
          <div className="border-x"><p className="font-display text-2xl font-semibold">348</p><p className="text-xs text-muted-foreground">Followers</p></div>
          <div><p className="font-display text-2xl font-semibold">92</p><p className="text-xs text-muted-foreground">Following</p></div>
        </div>

        <Tabs defaultValue="recipes" className="mt-10">
          <TabsList className="rounded-full">
            <TabsTrigger value="recipes" className="rounded-full">My recipes</TabsTrigger>
            <TabsTrigger value="saved" className="rounded-full">Saved</TabsTrigger>
            <TabsTrigger value="about" className="rounded-full">About</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="recipes" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </TabsContent>
          <TabsContent value="saved" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </TabsContent>
          <TabsContent value="about" className="mt-6 rounded-2xl border bg-card p-6">
            <h3 className="font-display text-xl font-semibold">About Aria</h3>
            <p className="mt-3 text-muted-foreground">
              Self-taught cook from Lisbon obsessed with Mediterranean flavors,
              slow cooking, and desserts that don't take themselves too seriously.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" /> aria@saveur.app
            </p>
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <form className="grid gap-4 rounded-2xl border bg-card p-6 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input defaultValue="Aria Bennett" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue="aria@saveur.app" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Bio</Label>
                <Textarea rows={3} defaultValue="Home cook, cookbook collector, sourdough obsessive." />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button className="rounded-full">Save changes</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}
