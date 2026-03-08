const SkeletonCard = () => (
  <div className="glass-card overflow-hidden">
    <div className="h-52 animate-shimmer rounded-t-2xl" />
    <div className="p-4 space-y-2">
      <div className="h-4 w-2/3 animate-shimmer rounded" />
      <div className="h-3 w-1/3 animate-shimmer rounded" />
    </div>
  </div>
);

export default SkeletonCard;
