import { motion } from "framer-motion";
import { Shield, Lock, Users, CheckCircle } from "lucide-react";

const trustPoints = [
  {
    icon: Shield,
    title: "Verified Guests Only",
    description: "Every attendee is ID-verified before joining our events.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Industry-standard encryption for all transactions.",
  },
  {
    icon: Users,
    title: "Professional Staff",
    description: "Trained event managers ensuring smooth experiences.",
  },
  {
    icon: CheckCircle,
    title: "Quality Guaranteed",
    description: "Premium venues, curated music, and memorable vibes.",
  },
];

export const TrustSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden" id="safety">
      {/* Background effect */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-[800px] h-[800px]"
          style={{
            background: "conic-gradient(from 0deg, hsl(195 100% 50% / 0.2), hsl(280 85% 65% / 0.2), hsl(12 88% 65% / 0.2), hsl(195 100% 50% / 0.2))",
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
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Your <span className="gradient-text">Safety</span> First
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We've built UnrealVibe with trust and safety at the core. Party with peace of mind.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {trustPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-8 rounded-2xl hover-lift"
            >
              <div className="flex items-start gap-6">
                <div className="glass-strong p-4 rounded-2xl">
                  <point.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{point.title}</h3>
                  <p className="text-muted-foreground">{point.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="glass-strong inline-block px-8 py-4 rounded-full">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Launching </span> this Christmas •{" "}
              <span className="font-semibold text-foreground">Exclusive </span> First Party •{" "}
              <span className="font-semibold text-foreground">100% </span> Safe
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
