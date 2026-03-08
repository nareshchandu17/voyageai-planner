import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, CalendarDays, Users, Mail, User } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  travelers: z.number().min(1, "At least 1 traveler").max(20, "Max 20 travelers"),
  date: z.string().min(1, "Please select a date"),
  message: z.string().trim().max(500).optional(),
});

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle: string;
  tourPrice: string;
  tourDuration: string;
}

const BookingModal = ({ isOpen, onClose, tourTitle, tourPrice, tourDuration }: BookingModalProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", travelers: 1, date: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = bookingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Booking Request Sent! 🎉",
        description: `Your trip to ${tourTitle} has been submitted. We'll reach out to ${form.email} shortly.`,
      });
      onClose();
      setForm({ name: "", email: "", travelers: 1, date: "", message: "" });
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-3xl shadow-glass-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-0">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Book Your Trip</h2>
                  <p className="text-sm text-muted-foreground mt-1">{tourTitle}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4 text-foreground" />
                </motion.button>
              </div>

              {/* Price badge */}
              <div className="px-6 pt-4">
                <div className="bg-secondary/50 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Starting from</span>
                    <p className="font-display text-2xl font-bold text-foreground">${tourPrice}</p>
                  </div>
                  <span className="text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-full border border-border">
                    {tourDuration}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean/40 transition-all"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean/40 transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Travelers</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={form.travelers}
                        onChange={(e) => setForm({ ...form, travelers: parseInt(e.target.value) || 1 })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ocean/40 transition-all"
                      />
                    </div>
                    {errors.travelers && <p className="text-xs text-destructive mt-1">{errors.travelers}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Preferred Date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ocean/40 transition-all"
                      />
                    </div>
                    {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Special Requests <span className="text-muted-foreground">(optional)</span></label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    maxLength={500}
                    placeholder="Any dietary requirements, accessibility needs, or special occasions..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ocean/40 transition-all resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 bg-foreground text-background font-semibold py-3.5 rounded-full hover:bg-foreground/90 transition-colors text-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      Confirm Booking
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
