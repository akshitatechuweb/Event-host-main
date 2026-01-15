import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "./ui/button";
import { Sparkles, Users, Shield, ArrowDown } from "lucide-react";
import partyHero from "@/assets/party-hero.jpg";
import { useRef } from "react";
import { CldImage } from "./common/CldImage";

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video-like background */}
      <motion.div
        style={{ scale, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
        <CldImage
          src={partyHero}
          alt="Cozy house party with friends having fun"
          className="w-full h-full object-cover brightness-[0.6] contrast-110"
        />
        {/* Animated overlay */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(0,191,255,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(255,105,180,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, rgba(138,43,226,0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(0,191,255,0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 z-20"
        />
      </motion.div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto relative z-30 px-4 py-20 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 glass-strong px-6 py-3 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Where Strangers Become Friends</span>
          </motion.div>

          {/* Main heading with staggered animation */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold leading-tight"
            >
              <motion.span
                className="inline-block "
                whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
              >
                Experience The
              </motion.span>
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold leading-tight"
            >
              <motion.span
                className="gradient-text inline-block font-party font-bold"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Unreal Vibe
              </motion.span>
            </motion.h1>
          </div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed"
          >
            Join curated parties where strangers connect, vibe, and create unforgettable memories together.
            <br />
            <span className="text-primary font-semibold">Safe, verified, and absolutely epic.</span>
          </motion.p>

          {/* Trust indicators with hover effects */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Verified Guests</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Users className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">1000+ Happy Vibers</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">Premium Experience</span>
            </motion.div>
          </motion.div>

          {/* CTA Button with enhanced animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="pt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="text-lg px-12 py-7 rounded-full bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-opacity text-background font-semibold shadow-2xl relative overflow-hidden group"
              > 
              <a
                  href="https://forms.gle/ZRwTeBJvsTrBwr657"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative">Join The Vibe</span>
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="pt-12"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-sm">Scroll to explore</span>
              <ArrowDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
