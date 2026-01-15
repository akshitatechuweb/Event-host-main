import { motion, useScroll, useTransform } from "framer-motion";
import { Smartphone, Heart, Calendar, MessageCircle, Star, TrendingUp } from "lucide-react";
import appMockup from "@/assets/app-mockup.png";
import { useRef } from "react";
import { CldImage } from "./common/CldImage";

const features = [
  {
    icon: Calendar,
    title: "Discover Events",
    description: "Browse curated parties tailored to your vibe",
  },
  {
    icon: Heart,
    title: "Match Interests",
    description: "Connect with people who share your energy",
  },
  {
    icon: MessageCircle,
    title: "Chat Before",
    description: "Break the ice in group chats before the event",
  },
  {
    icon: Star,
    title: "Create Memories",
    description: "Share photos and moments from epic nights",
  },
];

export const TransformSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-32 px-4 relative overflow-hidden" id="about">
      {/* Animated background gradient */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, hsl(195 100% 50% / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, hsl(280 85% 65% / 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, hsl(195 100% 50% / 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
          >
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">SOCIAL REVOLUTION</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Transform Your <span className="gradient-text">Social Life</span>
            <br />
            With One App
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From solo to social butterfly - UnrealVibe makes meeting new people effortless,
            exciting, and absolutely addictive.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Phone mockup */}
          <motion.div
            style={{ y, opacity }}
            className="relative"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10"
            >
              <CldImage
                src={appMockup}
                alt="UnrealVibe App Interface"
                className="w-full max-w-md mx-auto drop-shadow-2xl rounded-2xl"
              />
            </motion.div>

            {/* Floating elements around phone */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30"
              style={{
                background: "radial-gradient(circle, hsl(12 88% 65%) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />
            <motion.div
              animate={{
                rotate: [360, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-30"
              style={{
                background: "radial-gradient(circle, hsl(195 100% 50%) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />
          </motion.div>

          {/* Right side - Features */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ x: 10, scale: 1.02 }}
                className="glass-card p-6 rounded-2xl hover-lift cursor-pointer group"
              >
                <div className="flex items-start gap-6">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className="glass-strong p-4 rounded-2xl group-hover:bg-gradient-to-r group-hover:from-primary/20 group-hover:to-accent/20 transition-all"
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 group-hover:gradient-text transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: "Launching", label: "This Christmas Night" },
            { number: "Handpicked", label: "Guests For The First Vibe" },
            { number: "Zero", label: "Creeps. Every Profile Checked" },
            { number: "100%", label: "Focused On Safe Fun" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-strong p-6 rounded-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
                className="text-4xl font-bold gradient-text mb-2"
              >
                {stat.number}
              </motion.div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
