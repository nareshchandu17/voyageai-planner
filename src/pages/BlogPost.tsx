import { useParams, Link } from "react-router-dom";
import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blogData";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((b) => b.slug === slug);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 200]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.15]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const titleY = useTransform(scrollY, [0, 400], [0, -60]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">Blog Not Found</h1>
          <Link to="/blog" className="text-primary underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const midIndex = Math.floor(post.sections.length / 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Parallax Hero */}
      <section ref={heroRef} className="relative h-[85vh] min-h-[500px] overflow-hidden flex items-end justify-center">
        <motion.img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: heroY, scale: heroScale }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <motion.div
          className="relative z-10 text-center px-4 pb-16 max-w-3xl mx-auto"
          style={{ y: titleY, opacity: heroOpacity }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {post.title}
          </motion.h1>
          <motion.p
            className="text-primary-foreground/70 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {post.date}
          </motion.p>
        </motion.div>
      </section>

      {/* Back link */}
      <div className="container mx-auto px-4 sm:px-6 pt-10">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all stories
        </Link>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 sm:px-6 py-16 max-w-3xl">
        {/* First half of sections */}
        {post.sections.slice(0, midIndex).map((section, i) => (
          <ScrollReveal key={i} delay={i * 80}>
            <motion.div
              className="mb-14"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
                {section.heading}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {section.text}
              </p>
            </motion.div>
          </ScrollReveal>
        ))}

        {/* Mid-article featured image with parallax */}
        <ScrollReveal>
          <ContentImage src={post.contentImage} alt={post.title} />
        </ScrollReveal>

        {/* Second half of sections */}
        {post.sections.slice(midIndex).map((section, i) => (
          <ScrollReveal key={i + midIndex} delay={i * 80}>
            <motion.div
              className="mb-14"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
                {section.heading}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {section.text}
              </p>
            </motion.div>
          </ScrollReveal>
        ))}
      </article>

      <CTASection />
      <Footer />
    </div>
  );
};

// Parallax content image component
const ContentImage = ({ src, alt }: { src: string; alt: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <motion.div
      ref={ref}
      className="relative rounded-2xl overflow-hidden my-16 aspect-[16/10]"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ y }}
      />
    </motion.div>
  );
};

export default BlogPost;
