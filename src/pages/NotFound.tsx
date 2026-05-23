import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Compass, Home, Plane, MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { to: "/plan", label: "Plan a Trip", icon: Plane },
    { to: "/discover", label: "Discover", icon: Compass },
    { to: "/dashboard", label: "My Trips", icon: MapPin },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md w-full glass-card p-10"
      >
        <div className="w-20 h-20 rounded-3xl gradient-ocean flex items-center justify-center mx-auto mb-6 animate-float shadow-lg">
          <Compass className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="font-display text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="font-display text-xl font-semibold text-foreground mb-2">You've wandered off the map</p>
        <p className="text-sm text-muted-foreground font-body mb-2">
          The page <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-xs">{location.pathname}</code> doesn't exist.
        </p>
        <p className="text-sm text-muted-foreground font-body mb-8">Let's get you back on the trail.</p>

        <Link to="/" className="block mb-6">
          <Button variant="ocean" size="lg" className="w-full shadow-lg">
            <Home className="w-4 h-4" /> Return Home
          </Button>
        </Link>

        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground font-body mb-3 uppercase tracking-wider">Or explore</p>
          <div className="grid grid-cols-3 gap-2">
            {quickLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
              >
                <l.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-foreground">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
