import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar, ArrowRight } from "lucide-react";
import tokyoImg from "@/assets/dest-tokyo.jpg";
import baliImg from "@/assets/dest-bali.jpg";
import parisImg from "@/assets/dest-paris.jpg";

const trips = [
  { id: 1, image: tokyoImg, destination: "Tokyo, Japan", dates: "Mar 15–22, 2026", status: "upcoming" as const },
  { id: 2, image: baliImg, destination: "Bali, Indonesia", dates: "Jan 5–12, 2026", status: "completed" as const },
  { id: 3, image: parisImg, destination: "Paris, France", dates: "Apr 1–8, 2026", status: "planning" as const },
];

const statusColors: Record<string, string> = {
  upcoming: "bg-ocean-lighter text-ocean",
  completed: "bg-muted text-muted-foreground",
  planning: "bg-sunset-glow text-sunset",
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">My Trips</h1>
            <p className="text-muted-foreground">Manage and review your travel plans</p>
          </div>
          <Link to="/plan">
            <Button variant="ocean">
              <Plus className="w-4 h-4" /> New Trip
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {["All", "Upcoming", "Planning", "Completed"].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors first:bg-ocean first:text-primary-foreground"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Trip cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link key={trip.id} to="/itinerary" className="group glass-card overflow-hidden hover-lift">
              <div className="relative h-44 overflow-hidden">
                <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 right-3">
                  <span className={`${statusColors[trip.status]} text-xs font-medium px-3 py-1 rounded-full capitalize`}>
                    {trip.status}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ocean" />
                  {trip.destination}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {trip.dates}
                </p>
                <div className="mt-4 flex items-center text-sm text-ocean font-medium group-hover:gap-2 transition-all gap-1">
                  View Itinerary <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state placeholder */}
        {trips.length === 0 && (
          <div className="text-center py-20 glass-card">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">No trips yet</h3>
            <p className="text-muted-foreground mb-6">Start planning your first adventure</p>
            <Link to="/plan">
              <Button variant="ocean">Plan My First Trip</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
