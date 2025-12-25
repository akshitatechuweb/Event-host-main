import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { name: "Events", href: "/#events" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Safety", href: "/#safety" },
    { name: "About", href: "/#about" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none"
    >
      <motion.div
        className={cn(
          "pointer-events-auto glass-card border border-border/60 rounded-full max-w-5xl w-full mx-4 px-4 sm:px-6 lg:px-8",
          "transition-all duration-300",
          isScrolled
            ? "shadow-xl bg-background/90 backdrop-blur-xl"
            : "shadow-md bg-background/70 backdrop-blur-lg",
        )}
        animate={{
          scale: isScrolled ? 0.96 : 1,
          y: isScrolled ? 0 : 2,
        }}
      >
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            {/* <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-primary via-accent to-secondary animate-glow" /> */}
            🎉
            <span className="text-lg sm:text-2xl font-bold gradient-text">
              UnrealVibe
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                whileHover={{ y: -2 }}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative story-link"
              >
                {link.name}
              </motion.a>
            ))}
            <Button
              size="sm"
              className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-background font-semibold"
            >
              <a
                  href="https://forms.gle/ZRwTeBJvsTrBwr657"
                  target="_blank"
                  rel="noopener noreferrer"
                >
              Join Now
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden glass-card p-2 rounded-full border border-border/60"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pt-2 pb-3"
          >
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block py-2.5 text-sm text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Button
              size="sm"
              className="w-full mt-2 rounded-full bg-gradient-to-r from-primary to-accent text-background font-semibold"
            >
              <a
                  href="https://forms.gle/ZRwTeBJvsTrBwr657"
                  target="_blank"
                  rel="noopener noreferrer"
                >
              Join Now
              </a>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.nav>
  );
};
