import { Star, MapPin, Users } from "lucide-react";
import { getPlacePhotoUrl } from "@/lib/streamChat";

interface PlaceCardProps {
  name: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  photoReference?: string;
  types?: string[];
  compact?: boolean;
}

const PlaceCard = ({
  name,
  address,
  rating,
  userRatingsTotal,
  photoReference,
  types,
  compact = false,
}: PlaceCardProps) => {
  const formatType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-2 hover:bg-secondary/70 transition-colors">
        {photoReference ? (
          <img
            src={getPlacePhotoUrl(photoReference, 100)}
            alt={name}
            className="w-14 h-14 rounded-lg object-cover shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm truncate">{name}</p>
          {rating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span className="text-amber-500 font-medium">{rating}</span>
              {userRatingsTotal && (
                <span className="flex items-center gap-0.5">
                  <Users className="w-3 h-3" />
                  {userRatingsTotal.toLocaleString()}
                </span>
              )}
            </div>
          )}
          {types?.length > 0 && (
            <p className="text-xs text-muted-foreground truncate">{types.slice(0, 2).map(formatType).join(" · ")}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
      <div className="aspect-[4/3] relative overflow-hidden">
        {photoReference ? (
          <img
            src={getPlacePhotoUrl(photoReference, 600)}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Rating badge */}
        {rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{rating}</span>
          </div>
        )}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-white text-lg leading-tight mb-1">{name}</h3>
          {types?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {types.slice(0, 2).map((type) => (
                <span
                  key={type}
                  className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white/90 text-xs rounded-full"
                >
                  {formatType(type)}
                </span>
              ))}
            </div>
          )}
          {userRatingsTotal && (
            <p className="text-white/70 text-xs flex items-center gap-1">
              <Users className="w-3 h-3" />
              {userRatingsTotal.toLocaleString()} reviews
            </p>
          )}
        </div>
      </div>
      
      {address && (
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{address}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PlaceCard;
