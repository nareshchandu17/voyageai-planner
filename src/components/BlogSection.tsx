import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import blogIslandImg from "@/assets/blog-island.jpg";
import blogEuropeImg from "@/assets/blog-europe.jpg";
import blogTempleImg from "@/assets/blog-temple.jpg";
import blogDesertImg from "@/assets/blog-desert.jpg";

const blogs = [
  {
    image: blogIslandImg,
    date: "25 Feb 2026",
    title: "Discovering Island Life Beyond Luxury",
  },
  {
    image: blogEuropeImg,
    date: "10 Mar 2026",
    title: "Experiencing Europe Beyond Tourist Routes",
  },
  {
    image: blogTempleImg,
    date: "18 Mar 2026",
    title: "Ancient Temples and Hidden Spiritual Paths",
  },
  {
    image: blogDesertImg,
    date: "22 Mar 2026",
    title: "Desert Adventures That Change Perspectives",
  },
];

const BlogSection = () => {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground tracking-widest uppercase">
              📝 Blogs
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground text-center mb-12 max-w-2xl mx-auto leading-tight">
            Inspiration And Tips For Your Next Travel Journey
          </h2>
        </ScrollReveal>

        {/* Blog grid - 2 columns on large, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {blogs.map((blog, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="group cursor-pointer">
                {/* Image card */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Arrow icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-foreground" />
                  </div>
                </div>
                {/* Text */}
                <p className="text-sm text-muted-foreground mb-1">{blog.date}</p>
                <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Explore stories bar */}
        <ScrollReveal>
          <div className="flex items-center gap-6 mt-4">
            <p className="text-lg sm:text-xl font-display font-medium text-foreground whitespace-nowrap">
              Explore stories that inspire travel
            </p>
            <div className="flex-1 h-px bg-border" />
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BlogSection;
