import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin, Clock, DollarSign, UtensilsCrossed, Camera, Bus,
  RefreshCw, Plus, Trash2, ChevronDown, ChevronUp, Sun, Sunset, Moon
} from "lucide-react";
import heroImg from "@/assets/dest-tokyo.jpg";

interface Activity {
  id: string;
  time: string;
  name: string;
  type: "visit" | "food" | "activity" | "transport";
  duration: string;
  cost: number;
  description: string;
  period: "morning" | "afternoon" | "evening";
}

const mockDays: { day: number; date: string; activities: Activity[] }[] = [
  {
    day: 1, date: "Day 1 — Arrival & Shibuya",
    activities: [
      { id: "1a", time: "10:00", name: "Senso-ji Temple", type: "visit", duration: "2h", cost: 0, description: "Tokyo's oldest temple in Asakusa", period: "morning" },
      { id: "1b", time: "12:30", name: "Ichiran Ramen", type: "food", duration: "1h", cost: 15, description: "Famous tonkotsu ramen chain", period: "morning" },
      { id: "1c", time: "14:00", name: "Shibuya Crossing", type: "activity", duration: "1.5h", cost: 0, description: "World's busiest pedestrian crossing", period: "afternoon" },
      { id: "1d", time: "16:00", name: "Meiji Shrine", type: "visit", duration: "1.5h", cost: 0, description: "Tranquil Shinto shrine in Harajuku", period: "afternoon" },
      { id: "1e", time: "18:30", name: "Omoide Yokocho", type: "food", duration: "2h", cost: 30, description: "Atmospheric alley of tiny yakitori bars", period: "evening" },
    ],
  },
  {
    day: 2, date: "Day 2 — Akihabara & Ueno",
    activities: [
      { id: "2a", time: "09:00", name: "Tsukiji Outer Market", type: "food", duration: "2h", cost: 25, description: "Fresh sushi and street food", period: "morning" },
      { id: "2b", time: "11:30", name: "teamLab Borderless", type: "activity", duration: "2h", cost: 30, description: "Digital art immersive museum", period: "morning" },
      { id: "2c", time: "14:00", name: "Akihabara", type: "visit", duration: "2h", cost: 20, description: "Electric Town — anime, manga, electronics", period: "afternoon" },
      { id: "2d", time: "17:00", name: "Ueno Park", type: "visit", duration: "1.5h", cost: 0, description: "Museums, temples, and cherry blossoms", period: "afternoon" },
      { id: "2e", time: "19:00", name: "Izakaya Dinner", type: "food", duration: "2h", cost: 35, description: "Traditional Japanese pub dining", period: "evening" },
    ],
  },
  {
    day: 3, date: "Day 3 — Day Trip to Kamakura",
    activities: [
      { id: "3a", time: "08:00", name: "Train to Kamakura", type: "transport", duration: "1h", cost: 10, description: "JR Yokosuka Line from Tokyo Station", period: "morning" },
      { id: "3b", time: "09:30", name: "Great Buddha", type: "visit", duration: "1h", cost: 5, description: "Iconic 13m bronze statue", period: "morning" },
      { id: "3c", time: "12:00", name: "Komachi Street", type: "food", duration: "1.5h", cost: 20, description: "Charming shopping street with local food", period: "afternoon" },
      { id: "3d", time: "14:00", name: "Hokoku-ji Temple", type: "visit", duration: "1.5h", cost: 5, description: "Bamboo grove temple with matcha tea", period: "afternoon" },
      { id: "3e", time: "18:00", name: "Shinjuku Night", type: "activity", duration: "3h", cost: 40, description: "Neon lights, bars, and Robot Restaurant area", period: "evening" },
    ],
  },
];

const typeIcons: Record<string, any> = {
  visit: Camera, food: UtensilsCrossed, activity: MapPin, transport: Bus,
};

const periodIcons: Record<string, any> = {
  morning: Sun, afternoon: Sunset, evening: Moon,
};

const Itinerary = () => {
  const [expandedDay, setExpandedDay] = useState(1);
  const totalBudget = 1200;
  const spent = mockDays.flatMap(d => d.activities).reduce((sum, a) => sum + a.cost, 0);

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <div className="relative h-64 sm:h-80">
        <img src={heroImg} alt="Tokyo" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Tokyo, Japan</h1>
          <p className="text-muted-foreground">5 days · 2 travelers · Culture & Food</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Duration", value: "5 Days", icon: Clock },
            { label: "Activities", value: "15+", icon: MapPin },
            { label: "Budget", value: `$${totalBudget}`, icon: DollarSign },
            { label: "Spent", value: `$${spent}`, icon: DollarSign },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <s.icon className="w-5 h-5 text-ocean mx-auto mb-1" />
              <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div className="glass-card p-5 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Budget Progress</span>
            <span className="font-medium text-foreground">${spent} / ${totalBudget}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-ocean rounded-full transition-all duration-500"
              style={{ width: `${Math.min((spent / totalBudget) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Day-by-day */}
        <div className="space-y-4">
          {mockDays.map((day) => (
            <div key={day.day} className="glass-card overflow-hidden">
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? 0 : day.day)}
                className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {day.day}
                  </div>
                  <span className="font-display font-semibold text-foreground">{day.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    ${day.activities.reduce((s, a) => s + a.cost, 0)}
                  </span>
                  {expandedDay === day.day ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </div>
              </button>

              {expandedDay === day.day && (
                <div className="px-5 pb-5 animate-in">
                  {(["morning", "afternoon", "evening"] as const).map((period) => {
                    const acts = day.activities.filter((a) => a.period === period);
                    if (!acts.length) return null;
                    const PeriodIcon = periodIcons[period];
                    return (
                      <div key={period} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 mb-3">
                          <PeriodIcon className="w-4 h-4 text-sunset" />
                          <span className="text-sm font-medium text-foreground capitalize">{period}</span>
                        </div>
                        <div className="space-y-3 ml-6 border-l-2 border-border pl-4">
                          {acts.map((activity) => {
                            const Icon = typeIcons[activity.type];
                            return (
                              <div key={activity.id} className="group relative bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-ocean-lighter flex items-center justify-center shrink-0">
                                      <Icon className="w-4 h-4 text-ocean" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-foreground">{activity.name}</h4>
                                      <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.time}</span>
                                        <span>{activity.duration}</span>
                                        {activity.cost > 0 && <span className="text-sunset font-medium">${activity.cost}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm"><Plus className="w-4 h-4" /> Add Activity</Button>
                    <Button variant="ghost" size="sm"><RefreshCw className="w-4 h-4" /> Regenerate</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
