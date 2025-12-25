import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RefreshCw, Clock, CreditCard, AlertCircle, CheckCircle, HelpCircle, Users, Calendar, Shield } from "lucide-react";

const RefundPolicy = () => {
  const refundTiers = [
    {
      timeframe: "7+ days before event",
      refund: "100% refund",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      timeframe: "3-7 days before event",
      refund: "75% refund",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      timeframe: "1-3 days before event",
      refund: "50% refund",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      timeframe: "Less than 24 hours",
      refund: "No refund",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
  ];

  const sections = [
    {
      icon: Users,
      title: "Guest Cancellations",
      content: [
        "If a guest wishes to cancel a confirmed booking made through the UnrealVibe app or website:",
        "Cancellations at least 48 hours before the event start time",
        "Guests will receive a refund of the total amount paid excluding service fees and applicable taxes. The refunded amount typically reflects the event fee only, and will be credited back within 5–7 working days, depending on the payment provider.",
        "Cancellations made less than 48 hours before the event",
        "No refund will be provided for bookings cancelled within 48 hours of the event start time."
      ],
    },
    {
      icon: Calendar,
      title: "Impact of Guest Cancellations on Minimum Guest Count",
      content: [
        "If a guest cancels at least 48 hours in advance and their cancellation causes the event's minimum guest count (as defined by the host) to fall below the required number:",
        "• The host may decide whether to proceed with the event or cancel it, provided they choose to cancel at least 24 hours prior to the event start time.",
        "• Hosts may exercise this option up to two times per month.",
        "If a guest cancels less than 48 hours before the event and the minimum guest count drops below the requirement:",
        "• The host must continue with the event if other guests are still booked.",
        "• In this case, 100% of the penalty amount charged to the guest (excluding service fees and taxes) will be transferred to the host."
      ],
    },
    {
      icon: AlertCircle,
      title: "Guest Penalties for Excessive Cancellations",
      content: [
        "A guest who cancels five events within a 12-month period will be temporarily barred from participating in UnrealVibe events.",
        "They may reinstate their account by paying a reactivation fee of ₹500."
      ],
    },
    {
      icon: Shield,
      title: "Host Cancellations",
      content: [
        "Hosts are expected to maintain reliability and consistency on UnrealVibe. However, if a cancellation is unavoidable, the following rules apply:",
        "Cancellations made 7 or more days before the event",
        "The cancellation is penalty-free. Guests will be refunded within a commercially reasonable period.",
        "Cancellations made within 7 days of the event",
        "Hosts may cancel up to two events per month, or up to three consecutive cancellations without penalty.",
        "Beyond this limit, the host will be barred from hosting on UnrealVibe.",
        "Hosts who are barred due to repeated cancellations may reactivate hosting privileges by paying a reactivation fee of ₹500."
      ],
    },
    {
      icon: CreditCard,
      title: "Host Penalties for Cancellations",
      content: [
        "When a host cancels a confirmed booking, UnrealVibe may apply one or more of the following actions:",
        "• Publishing an automated review on the event listing noting the cancellation",
        "• Blocking or disabling the host's event calendar for the dates of the cancelled event",
        "• Charging a cancellation fee, deducted from future payouts",
        "The host will be notified if any cancellation fee applies at the time of cancellation. UnrealVibe may also request a security deposit of ₹5,000 for future events if repeated cancellations occur."
      ],
    },
    {
      icon: Clock,
      title: "UnrealVibe-Initiated Cancellations",
      content: [
        "UnrealVibe reserves the right to cancel any confirmed booking if required for reasons of safety, platform integrity, legal compliance, or extenuating circumstances.",
        "In such situations, UnrealVibe will determine the appropriate refund, resolution, or support on a case-by-case basis."
      ],
    },
    {
      icon: CheckCircle,
      title: "Final Notes",
      content: [
        "Refund timelines may vary depending on the payment gateway or bank processing speed. Hosts and guests are encouraged to manage bookings responsibly to maintain community trust and a smooth user experience.",
        "By using UnrealVibe, you acknowledge that all cancellations and refund decisions will be made in accordance with this policy."
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
              <RefreshCw className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium uppercase tracking-wider">Fair & Transparent</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Refund <span className="gradient-text">Policy</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              At UnrealVibe, we aim to create smooth, reliable, and trust-driven experiences for both guests and hosts across all events listed on our platform. This Refund and Cancellation Policy outlines how cancellations, penalties, and refunds work on the UnrealVibe app. By booking or hosting an event through UnrealVibe, you acknowledge and accept the terms below.
            </p>
            
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: December 2024
            </p>
          </motion.div>

          {/* Refund Tiers - EXACT SAME AS ORIGINAL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-strong rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Refund Timeline</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {refundTiers.map((tier, index) => (
                <motion.div
                  key={tier.timeframe}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card rounded-xl p-6 text-center ${tier.bgColor}`}
                >
                  <p className="text-sm text-muted-foreground mb-2">{tier.timeframe}</p>
                  <p className={`text-xl font-bold ${tier.color}`}>{tier.refund}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Content Sections */}
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
                    <section.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Help */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Need a Refund?</h2>
              <p className="text-muted-foreground mb-4">
                Request refunds through your account dashboard or contact our support team.
              </p>
              <a
                href="mailto:refunds@unrealvibe.com"
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

export default RefundPolicy;
