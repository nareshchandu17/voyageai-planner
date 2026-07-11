import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "./DashboardSidebar";

/**
 * AppShell wraps the app with the dashboard-style sidebar for authenticated users.
 * Public/auth-less routes (landing, /auth) render children as-is.
 * The Dashboard page renders its own internal shell, so we skip wrapping there
 * to avoid nested sidebars.
 */
const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();

  const isAuthRoute = pathname === "/auth";
  const isDashboardRoute = pathname === "/dashboard";
  const isItineraryRoute = pathname === "/itinerary";

  if (isLoading || !user || isAuthRoute || isDashboardRoute || isItineraryRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <div className="flex max-w-[1500px] mx-auto">
        <DashboardSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
