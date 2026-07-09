import { Link } from "@tanstack/react-router";
import { ChefHat, Github, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-primary to-primary-glow text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-semibold">Saveur</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            An interactive recipe book for curious home cooks. Save, share, and
            discover something delicious every day.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/recipes" className="hover:text-foreground">All recipes</Link></li>
            <li><Link to="/categories" className="hover:text-foreground">Categories</Link></li>
            <li><Link to="/search" className="hover:text-foreground">Search</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Follow us</h4>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Github" className="hover:text-foreground"><Github className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 Saveur. A student project.</p>
          <p>Crafted with care and butter.</p>
        </div>
      </div>
    </footer>
  );
}
