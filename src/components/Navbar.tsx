import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Plane, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const hasHero = location.pathname === "/" || location.pathname === "/blog" || location.pathname.startsWith("/blog/") || location.pathname === "/plan" || location.pathname.startsWith("/discover");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/discover", label: "Discover" },
    { href: "/plan", label: "Plan Trip" },
    { href: "/dashboard", label: "My Trips" },
    { href: "/memories", label: "Memories" },
  ];

  const transparent = hasHero && !scrolled;

  // Hide navbar on auth + dashboard (dashboard has its own sidebar shell)
  if (location.pathname === "/auth" || location.pathname === "/dashboard") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4">
      <div className={`w-full max-w-5xl transition-all duration-500 rounded-full px-5 sm:px-8 border bg-white/15 backdrop-blur-2xl border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.15)]`}>
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-ocean flex items-center justify-center">
              <Plane className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className={`font-display text-lg font-bold transition-colors duration-500 ${transparent ? "text-primary-foreground" : "text-foreground"}`}>VoyageAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.href
                    ? transparent ? "bg-white/20 text-primary-foreground" : "bg-secondary text-foreground"
                    : transparent ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${transparent ? "text-primary-foreground" : "text-foreground"}`}>
                  <div className="w-7 h-7 rounded-full gradient-sunset flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-accent-foreground" />
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full ${transparent ? "text-primary-foreground hover:bg-white/10" : ""}`}
                  onClick={signOut}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full ${transparent ? "text-primary-foreground hover:bg-white/10" : ""}`}
                  onClick={() => navigate("/auth")}
                >
                  Sign in
                </Button>
                <Button variant="ocean" size="sm" className="rounded-full" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            className={`md:hidden p-2 rounded-full ${transparent ? "text-primary-foreground hover:bg-white/10" : "hover:bg-secondary"}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-card mx-4 mb-4 p-4 animate-in">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            {user ? (
              <>
                <div className="flex items-center gap-2 flex-1 px-3">
                  <div className="w-7 h-7 rounded-full gradient-sunset flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-accent-foreground" />
                  </div>
                  <span className="text-sm font-medium truncate">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { signOut(); setIsOpen(false); }}>
                  <LogOut className="w-4 h-4 mr-1" /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate("/auth"); setIsOpen(false); }}>Sign in</Button>
                <Button variant="ocean" size="sm" className="flex-1" onClick={() => { navigate("/auth"); setIsOpen(false); }}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
