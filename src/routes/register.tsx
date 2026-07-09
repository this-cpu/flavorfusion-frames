import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/register")({
  component: Register,
});

const perks = [
  "Save unlimited recipes to your collections",
  "Create beautiful, printable recipe cards",
  "Follow chefs and get personalized picks",
  "Plan your week with a smart meal planner",
];

function Register() {
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
          <h1 className="font-display text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join thousands of home cooks sharing what they make.
          </p>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first">First name</Label>
                <Input id="first" placeholder="Aria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last name</Label>
                <Input id="last" placeholder="Bennett" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@kitchen.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="At least 8 characters" />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="tos" className="mt-1" />
              <Label htmlFor="tos" className="text-sm font-normal text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy.
              </Label>
            </div>
            <Button size="lg" className="w-full rounded-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
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
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-2xl bg-white/10 p-5 backdrop-blur">
          <div className="flex -space-x-2">
            {[32, 12, 45, 5, 20].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/60?img=${i}`}
                alt=""
                className="h-8 w-8 rounded-full border-2 border-white/60"
              />
            ))}
          </div>
          <p className="mt-3 text-sm opacity-90">
            Loved by 8,400+ home cooks worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
