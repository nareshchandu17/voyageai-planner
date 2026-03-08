interface DestinationCardProps {
  image: string;
  name: string;
  country: string;
  budget: string;
  season: string;
  rating?: number;
}

const DestinationCard = ({ image, name, country, budget, season, rating }: DestinationCardProps) => {
  return (
    <div className="group glass-card overflow-hidden hover-lift cursor-pointer">
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <h3 className="font-display text-lg font-bold text-primary-foreground">{name}</h3>
          <p className="text-sm text-primary-foreground/80">{country}</p>
        </div>
        {rating && (
          <div className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-foreground">
            ⭐ {rating}
          </div>
        )}
      </div>
      <div className="p-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">From {budget}</span>
        <span className="text-xs bg-ocean-lighter text-ocean rounded-full px-3 py-1">{season}</span>
      </div>
    </div>
  );
};

export default DestinationCard;
