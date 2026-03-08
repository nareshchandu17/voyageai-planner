import { useState } from "react";
import { Plus, X, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const faqs = [
  {
    q: "What type of trips do you offer?",
    a: "We offer curated group trips, experiential travel across domestic and international destinations.",
  },
  {
    q: "Do you handle flights and visas?",
    a: "Yes, we assist with flight bookings, visa applications, and all travel documentation to make your journey seamless.",
  },
  {
    q: "How do I book a trip?",
    a: "Simply browse our packages, select your preferred trip, and complete the booking online. Our team will guide you through the rest.",
  },
  {
    q: "What payment options are available?",
    a: "We accept credit/debit cards, bank transfers, and offer flexible installment plans for select packages.",
  },
  {
    q: "Are your trips suitable for solo travelers?",
    a: "Absolutely! Many of our trips are designed with solo travelers in mind, offering safe and social experiences.",
  },
  {
    q: "Will there be on-ground support during the trip?",
    a: "Yes, every trip includes dedicated on-ground coordinators and 24/7 support throughout your journey.",
  },
  {
    q: "What is included in the trip cost?",
    a: "Trip costs typically cover accommodation, local transport, guided experiences, and select meals. Full details are listed on each package.",
  },
  {
    q: "Is travel insurance mandatory?",
    a: "We strongly recommend travel insurance for all trips. We can help you find the right coverage for your destination.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const leftFaqs = faqs.filter((_, i) => i % 2 === 0);
  const rightFaqs = faqs.filter((_, i) => i % 2 !== 0);

  return (
    <section className="py-20 sm:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground tracking-widest uppercase">
              <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground text-center mb-14 max-w-2xl mx-auto leading-tight">
            Everything You Need To Know Before You Travel
          </h2>
        </ScrollReveal>

        {/* Two-column FAQ grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-5xl mx-auto">
          {[leftFaqs, rightFaqs].map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-4">
              {column.map((faq, i) => {
                const realIndex = colIdx === 0 ? i * 2 : i * 2 + 1;
                const isOpen = openIndex === realIndex;
                return (
                  <ScrollReveal key={realIndex} delay={realIndex * 60}>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : realIndex)}
                      className="w-full text-left bg-card rounded-2xl border border-border p-6 transition-shadow hover:shadow-soft"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">
                          {faq.q}
                        </h3>
                        <span className="shrink-0 text-muted-foreground">
                          {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </ScrollReveal>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
