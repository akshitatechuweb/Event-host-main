import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { XCircle, Clock, ArrowRight, Calendar, AlertTriangle, Repeat, Shield, Users } from "lucide-react";

const DisclaimerPolicy = () => {
  const steps = [
    {
      step: "1",
      title: "Log into your account",
      description: "Access your UnrealVibe dashboard",
    },
    {
      step: "2",
      title: "Go to My Bookings",
      description: "Find your upcoming events",
    },
    {
      step: "3",
      title: "Select the booking",
      description: "Choose the event to cancel",
    },
    {
      step: "4",
      title: "Click Cancel",
      description: "Confirm your cancellation",
    },
  ];

  const sections = [
    {
      icon: Shield,
      title: "No Organizational Liability",
      content: [
        "UnrealVibe provides a platform that connects hosts and guests for private social events, house parties, and curated gatherings. By using our Platform — whether to host, attend, or browse events — you acknowledge and accept the following important points:",
        "UnrealVibe is not the organizer or operator of any event listed on the platform. All events are created and managed by individual hosts. We do not control, oversee, or guarantee the quality, legality, or safety of any event."
      ],
    },
    {
      icon: Users,
      title: "Own Risk & Assumption of Risk",
      content: [
        "Participation in any event involves inherent risks. By attending, you accept full personal responsibility for your safety, property, and well-being.",
        "UnrealVibe disclaims any liability for injuries, damages, loss, or costs arising out of your attendance or participation in an event."
      ],
    },
    {
      icon: AlertTriangle,
      title: "As-Is Service",
      content: [
        "The Platform is provided on an 'as-is' and 'as-available' basis. UnrealVibe makes no warranties — express or implied — regarding the Platform's performance, availability, accuracy, or fitness for any particular purpose.",
        "We do not guarantee that the app will always be error-free, continuously available, or secure from viruses or other harmful components. This is aligned with standard event-platform disclaimers."
      ],
    },
    {
      icon: Calendar,
      title: "Third-Party Content & Links",
      content: [
        "The Platform may include links to external websites, services, or content not controlled by us.",
        "UnrealVibe is not responsible for the content, availability, or practices of any third-party site. Accessing them is at your own risk."
      ],
    },
    {
      icon: Shield,
      title: "No Liability for Other Users",
      content: [
        "We disclaim any responsibility for the actions, behavior, or misconduct of other users (hosts or guests) at events.",
        "Any dispute, loss, or damage that arises from user-to-user interactions is strictly between the users involved; UnrealVibe is not a guarantor or mediator of third-party behavior. Similar to other event platform disclaimers."
      ],
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: [
        "To the maximum extent permitted by law, UnrealVibe and its affiliates, employees, agents, and partners shall not be liable for:",
        "• Direct, indirect, incidental, special, or consequential damages",
        "• Loss of data, profits, or goodwill",
        "• Any physical injury or property damage arising from events",
        "• Any other liability beyond what is expressly stated in our Terms"
      ],
    },
    {
      icon: Repeat,
      title: "Release & Indemnification",
      content: [
        "You agree to release, hold harmless, and indemnify UnrealVibe (and its affiliates, officers, and agents) from any claims, damages, losses, liabilities, or costs (including legal fees) arising out of:",
        "• Your use of the Platform",
        "• Your attendance at or participation in any event",
        "• Your violation of any rules, policies, or guidelines"
      ],
    },
    {
      icon: Clock,
      title: "Force Majeure",
      content: [
        "UnrealVibe is not responsible for any failure or delay in performing its obligations due to causes beyond its reasonable control, such as natural disasters, pandemics, technical failures, or any other event outside our control."
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full mb-6"
            >
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium uppercase tracking-wider">Important Notice</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Disclaimer & cancellation</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              UnrealVibe provides a platform that connects hosts and guests for private social events, house parties, and curated gatherings. By using our Platform — whether to host, attend, or browse events — you acknowledge and accept the following important points:
            </p>
            
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: December 2024
            </p>
          </motion.div>

          {/* How to Cancel Steps - KEPT EXACT SAME */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-strong rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">How to Cancel</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="glass-card rounded-xl p-6 text-center h-full">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center mx-auto mb-4">
                      <span className="font-bold text-background">{item.step}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-strong rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="glass-card p-3 rounded-xl">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Questions?</h2>
              <p className="text-muted-foreground mb-4">
                Contact our support team for any clarification.
              </p>
              <a
                href="mailto:support@unrealvibe.com"
                className="text-primary hover:underline"
              >
                contact@unrealvibe.com
              </a>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DisclaimerPolicy;
