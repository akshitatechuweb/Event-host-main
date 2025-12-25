import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

type ModalType = "contact" | "faq" | "safety" | "feedback" | null;


const FORMSPREE_CONTACT_URL = "https://formspree.io/f/xzznyprb";
const FORMSPREE_FEEDBACK_URL = "https://formspree.io/f/xpwvkadd";

interface FooterModalProps {
  open: boolean;
  type: ModalType;
  onClose: () => void;
}


const FooterModal = ({ open, type, onClose }: FooterModalProps) => {
  const [loading, setLoading] = useState(false);

  // 🔹 Local state for forms
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");

  if (!type) return null;

  const titles: Record<Exclude<ModalType, null>, string> = {
    contact: "Contact Us",
    faq: "FAQ",
    safety: "Safety Tips",
    feedback: "Share Feedback",
  };

  // 🔹 Submit handlers: send to external mail service
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(FORMSPREE_CONTACT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
          source: "UnrealVibe footer contact",
        }),
      });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(FORMSPREE_FEEDBACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback: feedbackText,
          email: feedbackEmail,
          source: "UnrealVibe footer feedback",
        }),
      });
      setFeedbackText("");
      setFeedbackEmail("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg mx-4 rounded-2xl bg-background/95 border border-border/40 shadow-2xl p-6 md:p-7"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-modal-title"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              ✕
            </button>

            <h3
              id="footer-modal-title"
              className="text-xl font-semibold mb-3 text-foreground"
            >
              {titles[type]}
            </h3>

            <p className="text-sm text-muted-foreground mb-5">
              {type === "contact" &&
                "Reach out for host inquiries, collaborations, or anything UnrealVibe."}
              {type === "faq" &&
                "Quick answers to the most common questions about UnrealVibe and our parties."}
              {type === "safety" &&
                "How we keep every vibe safe, respectful, and unforgettable."}
              {type === "feedback" &&
                "Tell us what you love and what we should improve for the next vibe."}
            </p>

            {/* 🔹 Contact form */}
            {type === "contact" && (
              <form className="space-y-3" onSubmit={handleContactSubmit}>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Your name
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    placeholder="Unreal Viber"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    placeholder="you@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60 min-h-[90px]"
                    placeholder="Tell us what’s on your mind..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 rounded-full bg-primary text-background text-sm font-semibold py-2.5 hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send message"}
                </button>
              </form>
            )}

            {/* 🔹 FAQ content */}
            {type === "faq" && (
              <div className="space-y-3 text-sm">
                <details className="group rounded-lg border border-border/40 bg-muted/20 p-3">
                  <summary className="cursor-pointer font-medium text-foreground">
                    How do I join a party?
                  </summary>
                  <p className="mt-2 text-muted-foreground">
                    Request an invite in the app and wait for host approval before payment.
                  </p>
                </details>
                <details className="group rounded-lg border border-border/40 bg-muted/20 p-3">
                  <summary className="cursor-pointer font-medium text-foreground">
                    Is it safe to attend?
                  </summary>
                  <p className="mt-2 text-muted-foreground">
                    Guests are verified and parties follow clear house rules to keep everyone safe.
                  </p>
                </details>
              </div>
            )}

            {/* 🔹 Safety tips */}
            {type === "safety" && (
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Only attend events through verified UnrealVibe hosts.</li>
                <li>• Share your event details with a trusted friend before you go.</li>
                <li>• Report any uncomfortable behavior directly in-app or via email.</li>
              </ul>
            )}

            {/* 🔹 Feedback form */}
            {type === "feedback" && (
              <form className="space-y-3" onSubmit={handleFeedbackSubmit}>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    How was your experience?
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60 min-h-[90px]"
                    placeholder="Be as real as you like — we read everything."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Optional email for follow-up
                  </label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    placeholder="you@email.com"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 rounded-full bg-primary text-background text-sm font-semibold py-2.5 hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Submit feedback"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const Footer = () => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (type: ModalType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  const footerLinks = {
    Company: [
      { name: "About Us", href: "#about" },
    ],
    Support: [
      // 🔹 These now open the modal instead of scrolling
      { name: "Contact Us", href: "#contact", modal: "contact" as ModalType },
      { name: "FAQ", href: "#faq", modal: "faq" as ModalType },
      { name: "Safety Tips", href: "#safety", modal: "safety" as ModalType },
      { name: "Feedback", href: "#feedback", modal: "feedback" as ModalType },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy-policy", isRoute: true },
      { name: "Terms of Service", href: "/terms-conditions", isRoute: true },
      { name: "Refund Policy", href: "/refund-policy", isRoute: true },
      { name: "Cancellation Policy", href: "/cancellation-policy", isRoute: true },
    ],
  };

  
const socialLinks = [
    // This now references the imported *component* variable:
    { icon: Instagram, href: "https://www.instagram.com/unrealvibe.app/",target: "_blank" },
    // { icon: Twitter, href: "#" },
    { icon: Mail, href: "mailto:contact@unrealvibe.com", target: "_blank" },
];
  const trustCards = [
    {
      title: "Safety First",
      description: "All attendees are verified. We prioritize your safety at every event.",
      color: "border-purple-500/30",
    },
    {
      title: "Community Guidelines",
      description: "We maintain high standards to ensure a respectful environment for all.",
      color: "border-orange-500/50",
    },
    {
      title: "Data Privacy",
      description: "Your information is encrypted and protected with industry standards.",
      color: "border-muted/30",
    },
  ];

  return (
    <footer className="relative pt-16 pb-8 px-4 overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute right-0 top-1/3 w-80 h-80 bg-orange-500/15 rounded-full blur-[100px]" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="text-2xl font-bold gradient-text">UnrealVibe</span>
            </motion.div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-xs">
              Creating unforgettable experiences where strangers become friends.
            </p>

            {/* Contact info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Noida, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+919220372564" className="hover:text-foreground transition-colors">
                  +91 92203 72564
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:contact@unrealvibe.com" className="hover:text-foreground transition-colors">
                  contact@unrealvibe.com
                </a>
              </div>
            </div>
          </div>

          {/* Links sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-base font-semibold mb-4 text-foreground">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    {"modal" in link && link.modal ? (
                      <button
                        type="button"
                        onClick={() => openModal(link.modal!)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </button>
                    ) : link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-foreground">Follow Us</h3>
            <div className="grid grid-cols-2 gap-3 max-w-[140px]">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <social.icon className="w-5 h-5 text-muted-foreground" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {trustCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-xl bg-muted/10 border ${card.color} backdrop-blur-sm`}
            >
              <h4 className="font-semibold text-foreground mb-2">{card.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-border/20 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UnrealVibe. All rights reserved.
          </p>
          <p> By AYAY VENTURES❤️</p>
        </div>
      </div>

      {/* 🔹 Modal mounted once at root */}
      <FooterModal open={isModalOpen} type={modalType} onClose={closeModal} />
    </footer>
  );
};
