import { motion } from "framer-motion";
import { UserPlus, Calendar, PartyPopper, Heart, Sparkles } from "lucide-react";
import friendsConnecting from "@/assets/friends-connecting.jpg";
import partyHero from "@/assets/party-hero.jpg";
import socialNetwork from "@/assets/social-network-3d.png";
import { CldImage } from "./common/CldImage";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Vibe Profile",
    description: "Share your interests, music taste, and what makes you unique",
    color: "text-primary",
  },
  {
    icon: Calendar,
    title: "Pick Your Party",
    description: "Browse events that match your energy and preferred crowd size",
    color: "text-secondary",
  },
  {
    icon: PartyPopper,
    title: "Show Up & Connect",
    description: "Meet pre-matched guests who share your interests and vibe",
    color: "text-accent",
  },
  {
    icon: Heart,
    title: "Build Real Friendships",
    description: "Turn one-night connections into lasting friendships",
    color: "text-primary",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden" id="how-it-works">
      {/* Background image with overlay */}
      <div className="absolute inset-0 opacity-10">
        <CldImage
          src={friendsConnecting}
          alt="Friends connecting at an UnrealVibe party"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
            className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-sm font-medium">THE MAGIC FORMULA</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            How <span className="gradient-text">UnrealVibe</span> Turns
            <br />
            Strangers Into <span className="gradient-text">Friends</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our proven 4-step process has helped thousands transform their social lives
            and build meaningful connections.
          </p>
        </motion.div>

        {/* Friendly, card-based layout instead of timeline */}
        <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {steps.map((step, index) => (
              <motion.article
                key={step.title}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="glass-strong rounded-3xl p-6 md:p-7 flex gap-5 items-start"
              >
                <div className={`${step.color} shrink-0`}>
                  <div className="glass-card w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </span>
                    <span>STEP {index + 1}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/80 pointer-events-none" />
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1 bg-background/30 backdrop-blur-sm text-xs font-medium">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span>From awkward hellos to group chats</span>
              </div>
              <div className="rounded-2xl overflow-hidden aspect-[4/5]">
                <CldImage
                  src={friendsConnecting}
                  alt="New friends bonding at an UnrealVibe house party"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Every UnrealVibe party is designed like the best house party you have ever been
                to - with curated guests, warm hosts, and icebreakers that actually work.
              </p>
            </div>
          </motion.aside>
        </div>

        {/* Success story section - image-first layout */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-32 glass-strong rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="relative z-10 grid lg:grid-cols-[1.1fr,1.5fr] gap-10 items-center">
            <div className="space-y-4 text-left">
              <h3 className="text-3xl md:text-4xl font-bold">
                Real Stories, Real <span className="gradient-text">Friendships</span>
              </h3>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl">
                See what actually happens when strangers walk into an UnrealVibe house party and
                walk out as a group chat.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="glass-card px-4 py-2 rounded-full text-xs md:text-sm text-muted-foreground">
                  1st party friendships that still meet weekly
                </div>
                <div className="glass-card px-4 py-2 rounded-full text-xs md:text-sm text-muted-foreground">
                  4.9/5 average party rating
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              <motion.figure
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative rounded-2xl overflow-hidden group"
              >
                <CldImage
                  src={friendsConnecting}
                  alt="Group of new friends laughing together at a house party"
                  className="w-full h-44 md:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                <figcaption className="absolute bottom-4 left-4 right-4 text-sm text-foreground">
                  "We met at a Tuesday house party and now spend every weekend together."
                  <span className="block text-xs text-muted-foreground mt-1">— Sarah &amp; team</span>
                </figcaption>
              </motion.figure>

              <motion.figure
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative rounded-2xl overflow-hidden group"
              >
                <CldImage
                  src={partyHero}
                  alt="Candid house party moment with cozy lighting"
                  className="w-full h-44 md:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                <figcaption className="absolute bottom-4 left-4 right-4 text-sm text-foreground">
                  "Showed up alone, left with three new friends and a shared Uber home."
                  <span className="block text-xs text-muted-foreground mt-1">— Kevin, 27</span>
                </figcaption>
              </motion.figure>

              <motion.figure
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative rounded-2xl overflow-hidden group sm:col-span-2"
              >
                <CldImage
                  src={socialNetwork}
                  alt="Group photo from an UnrealVibe party with everyone smiling"
                  className="w-full h-48 md:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                <figcaption className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm text-foreground">
                  <span>
                    "Our friend group is literally called the UnrealVibe Originals now."
                  </span>
                  <span className="px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm text-[11px] md:text-xs text-muted-foreground">
                    Taken at a real UnrealVibe house party
                  </span>
                </figcaption>
              </motion.figure>
            </div>
          </div>

          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, hsl(280 85% 65%) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </motion.section>
      </div>
    </section>
  );
};
