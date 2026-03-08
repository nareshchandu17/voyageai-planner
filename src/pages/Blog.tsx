import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import blogIslandImg from "@/assets/blog-island.jpg";
import blogEuropeImg from "@/assets/blog-europe.jpg";
import blogTempleImg from "@/assets/blog-temple.jpg";
import blogDesertImg from "@/assets/blog-desert.jpg";
import destBaliImg from "@/assets/dest-bali.jpg";
import destParisImg from "@/assets/dest-paris.jpg";
import destTokyoImg from "@/assets/dest-tokyo.jpg";
import destPeruImg from "@/assets/dest-peru.jpg";
import heroOceanBg from "@/assets/hero-ocean-bg.jpg";

const blogs = [
  { image: blogIslandImg, date: "25 Feb 2026", title: "Discovering Island Life Beyond Luxury" },
  { image: blogEuropeImg, date: "10 Mar 2026", title: "Experiencing Europe Beyond Tourist Routes" },
  { image: blogTempleImg, date: "13 Mar 2026", title: "Ancient Temples and Hidden Spiritual Paths" },
  { image: blogDesertImg, date: "22 Mar 2026", title: "Desert Adventures That Change Perspectives" },
  { image: destBaliImg, date: "19 Jan 2026", title: "Discovering the Soul of Bali" },
  { image: destParisImg, date: "05 Feb 2026", title: "A Parisian Weekend You Won't Forget" },
  { image: destTokyoImg, date: "28 Feb 2026", title: "Tokyo After Dark: Neon & Nightlife" },
  { image: destPeruImg, date: "12 Mar 2026", title: "Discovering the Calm of Mountain Travel" },
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <img
          src={heroOceanBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-4">
            Travel Stories & Guides
          </h1>
          <p className="text-primary-foreground/80 text-lg sm:text-xl max-w-lg mx-auto">
            Stories, Tips, And Insights To Inspire Your Journey.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {blogs.map((blog, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="group cursor-pointer">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5 text-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{blog.date}</p>
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Blog;
