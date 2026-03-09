import { Calendar, MapPin, Ticket, DollarSign } from "lucide-react";

interface EventCardProps {
  name: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  category?: string;
  genre?: string;
  priceRange?: { min: number; max: number; currency: string };
  image?: string;
  url?: string;
  compact?: boolean;
}

const EventCard = ({
  name,
  date,
  time,
  venue,
  city,
  category,
  genre,
  priceRange,
  image,
  url,
  compact = false,
}: EventCardProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
  };

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-secondary/50 rounded-xl p-2 hover:bg-secondary/70 transition-colors"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-14 h-14 rounded-lg object-cover shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5 text-accent" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm truncate">{name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {date && <span>{formatDate(date)}</span>}
            {venue && <span className="truncate">· {venue}</span>}
          </div>
          {priceRange && (
            <p className="text-xs text-accent font-medium">${priceRange.min}+</p>
          )}
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-accent/30 transition-all shadow-sm hover:shadow-md"
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
            <Ticket className="w-12 h-12 text-accent/50" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Category badge */}
        {(category || genre) && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-lg">
            {genre || category}
          </div>
        )}

        {/* Price badge */}
        {priceRange && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-semibold">{priceRange.min}</span>
            <span className="text-white/70">+</span>
          </div>
        )}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-white text-lg leading-tight mb-2 line-clamp-2">{name}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/80 text-xs">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(date)}{time && ` · ${time.slice(0, 5)}`}
              </span>
            )}
            {venue && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {venue}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export default EventCard;
