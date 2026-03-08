import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import blogHeroBg from "@/assets/blog-hero-bg.jpg";
import { blogPosts } from "@/data/blogData";

const Blog = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.12]);
  const overlayOpacity = useTransform(scrollY, [0, 400], [0.4, 0.7]);

  return (
    <div className="min-h-screen">
      {/* Parallax Hero Banner */}
      <section
        ref={heroRef}
        className="relative h-[50vh] min-h-[380px] flex items-center justify-center overflow-hidden"
      >
        <motion.img
          src={blogHeroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: heroY, scale: heroScale }}
        />
        <motion.div
          className="absolute inset-0 bg-foreground"
          style={{ opacity: overlayOpacity }}
        />
        <div className="relative z-10 text-center px-4">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Travel Stories & Guides
          </motion.h1>
          <motion.p
            className="text-primary-foreground/80 text-lg sm:text-xl max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Stories, Tips, And Insights To Inspire Your Journey.
          </motion.p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {blogPosts.map((blog, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <Link to={`/blog/${blog.slug}`} className="group cursor-pointer block">
                  <motion.div
                    className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5 text-foreground" />
                    </div>
                  </motion.div>
                  <p className="text-sm text-muted-foreground mb-1">{blog.date}</p>
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
};

export default Blog;
