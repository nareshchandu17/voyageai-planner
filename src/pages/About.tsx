import { Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground">About VoyageAI</h1>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          We are passionate travel experts creating unforgettable journeys beyond sightseeing. Every itinerary combines comfort, discovery, and meaningful experiences.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Our AI-powered platform analyzes thousands of travel data points to craft personalized itineraries that match your style, budget, and interests. Whether you're a solo adventurer, a family on vacation, or a digital nomad exploring the world — VoyageAI helps you travel smarter and deeper.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Founded by travelers, for travelers. We believe the best trips aren't just planned — they're felt.
        </p>
      </div>
    </div>
  );
};

export default About;
