import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Calendar, MapPin, Users, Sparkles, Gift, Music, Camera, Utensils } from "lucide-react";

export const ChristmasParty = () => {
  const perks = [
    { icon: Utensils, text: "Premium snacks & drinks" },
    { icon: Music, text: "Live DJ performance" },
    { icon: Gift, text: "Secret Santa exchange" },
    { icon: Camera, text: "Professional photos" },
  ];

  return (
    <section className="py-32 px-4 relative overflow-hidden" id="events">
      {/* Animated background particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(${Math.random() * 60 + 340}, 80%, 60%)`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(12 88% 65% / 0.4) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full mb-6"
          >
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
            <span className="text-sm font-medium uppercase tracking-wider">FIRST EVENT ALERT</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-4"
          >
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
              className="gradient-text"
            >
              <span className="font-party font-bold "> Christmas Eve </span>
            </motion.span>{" "}
            Party 
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-muted-foreground"
          >
            🎄 Our inaugural celebration - Be part of history 🎄
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-strong rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          {/* Animated border effect */}
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "conic-gradient(from 0deg, transparent, hsl(12 88% 65% / 0.5), transparent)",
              padding: "2px",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left side - Details */}
            <div className="space-y-8">
              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.03, x: 5 }}
                  className="flex items-start gap-4 glass-card p-4 rounded-2xl"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="glass-strong p-3 rounded-xl"
                  >
                    <Calendar className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="text-xl font-semibold">December 25th, 2024</p>
                    <p className="text-sm text-muted-foreground">7:00 PM onwards</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, x: 5 }}
                  className="flex items-start gap-4 glass-card p-4 rounded-2xl"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="glass-strong p-3 rounded-xl"
                  >
                    <MapPin className="w-6 h-6 text-secondary" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="text-xl font-semibold">Villa</p>
                    <p className="text-sm text-muted-foreground">Noida</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, x: 5 }}
                  className="flex items-start gap-4 glass-card p-4 rounded-2xl"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="glass-strong p-3 rounded-xl"
                  >
                    <Users className="w-6 h-6 text-accent" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="text-xl font-semibold">Limited to 100 Vibers</p>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-sm text-green-400 font-medium">65 spots left</p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* What's included */}
              <div className="pt-4 border-t border-border/30">
                <h4 className="text-lg font-semibold mb-4">What's Included:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {perks.map((perk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, x: 5 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <perk.icon className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{perk.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex flex-col space-y-8">
              {/* Price section */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-card p-8 rounded-3xl text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  🎄
                </motion.div>
                
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-3 mb-2">
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="text-5xl font-bold gradient-text"
                    >
                      ₹1,999
                    </motion.span>
                    <span className="text-xl text-muted-foreground line-through">₹2,999</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex glass-strong px-4 py-2 rounded-full"
                  >
                    <span className="text-sm font-medium text-secondary">
                      🎉 Early Bird: 33% OFF
                    </span>
                  </motion.div>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="w-full text-lg py-7 rounded-full bg-gradient-to-r from-secondary via-accent to-primary hover:opacity-90 transition-opacity text-background font-semibold shadow-2xl relative overflow-hidden group"
                    onClick={() => window.open("https://wa.me/919220372564?text=Hi! I'd like to book a spot for the Christmas Eve Party!", "_blank")}
                  >
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Book Your Spot Now
                    </span>
                  </Button>
                </motion.div>

                <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Secure payment
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Instant confirmation
                  </span>
                </p>
              </motion.div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent" />
                  <div>
                    <p className="font-semibold text-sm">Priya S.</p>
                    <p className="text-xs text-muted-foreground">Early bird viber</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Can't wait for the first event! Already chatting with future party friends in the group. This is going to be epic! 🎉"
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
