import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/Layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PLACEHOLDER_IMG } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  const { user, profile, primaryRole, refresh } = useAuth();
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");

  const { data: myRecipes = [] } = useQuery({
    queryKey: ["my-recipes", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("recipes").select("*").eq("author_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, username, bio, avatar_url: avatarUrl })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Profile updated");
      await refresh();
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="text-2xl">
            {(displayName || user?.email || "U").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-display text-3xl font-semibold">{displayName || "Your profile"}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
          {primaryRole && (
            <Badge variant="secondary" className="mt-2 capitalize">
              {primaryRole === "homecook" ? "Home cook" : primaryRole}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="settings" className="mt-8">
        <TabsList className="rounded-full">
          <TabsTrigger value="settings" className="rounded-full">Settings</TabsTrigger>
          <TabsTrigger value="recipes" className="rounded-full">My recipes ({myRecipes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <div className="max-w-2xl space-y-4 rounded-2xl border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="dn">Display name</Label>
              <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="un">Username</Label>
              <Input id="un" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="av">Avatar URL</Label>
              <Input id="av" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recipes" className="mt-6">
          {myRecipes.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center">
              <p className="text-muted-foreground">You haven't posted any recipes yet.</p>
              <Link to="/recipes/add" className="mt-4 inline-block">
                <Button className="rounded-full">Add your first recipe</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myRecipes.map((r) => (
                <div key={r.id} className="overflow-hidden rounded-2xl border bg-card">
                  <img src={r.image_url || PLACEHOLDER_IMG} className="aspect-[4/3] w-full object-cover" alt="" />
                  <div className="p-4">
                    <h3 className="font-medium">{r.title}</h3>
                    <div className="mt-3 flex gap-2">
                      <Link to="/recipes/$id" params={{ id: r.id }}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                      <Link to="/recipes/edit/$id" params={{ id: r.id }}>
                        <Button size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
