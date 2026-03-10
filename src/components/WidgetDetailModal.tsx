import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, Bus, Utensils, Camera, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetItem {
  name: string;
  rating?: number;
  distance?: string;
  description?: string;
  price?: string;
  type?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: "restaurants" | "attractions" | "hotels" | "transport";
  items: WidgetItem[];
}

const iconMap = {
  restaurants: Utensils,
  attractions: Camera,
  hotels: Hotel,
  transport: Bus,
};

const colorMap = {
  restaurants: "text-accent",
  attractions: "text-primary",
  hotels: "text-accent",
  transport: "text-primary",
};

const WidgetDetailModal = ({ open, onClose, title, icon, items }: Props) => {
  const Icon = iconMap[icon];
  const color = colorMap[icon];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Items */}
            <div className="p-5 space-y-3 overflow-y-auto max-h-[60vh]">
              {items.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No items available yet.</p>
              )}
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {item.rating && (
                          <span className="text-xs text-accent flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> {item.rating}
                          </span>
                        )}
                        {item.distance && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.distance}
                          </span>
                        )}
                        {item.price && (
                          <span className="text-xs text-foreground font-medium">{item.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WidgetDetailModal;
