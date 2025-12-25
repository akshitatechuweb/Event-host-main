import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, Users, Calendar, AlertTriangle, Scale, MessageSquare, PartyPopper } from "lucide-react";

const TermsConditions = () => {
  const sections = [
  {
    icon:PartyPopper ,
    title: "Welcome to UnrealVibe",
    content: [
      "Welcome to UnrealVibe (“we”, “us”, “our”). UnrealVibe is a platform that helps users discover, request entry, host, and attend private house parties and social meetups across Delhi-NCR and selected regions in India (the “Platform”).",
      "By downloading, installing, or using the UnrealVibe mobile application or website (collectively, the “Service”), you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, please uninstall the app and stop using the Service."
    ],
  },
  {
    icon: Users,
    title: "Eligibility & Account",
    content: [
      "You must be 18 years or older to use UnrealVibe.",
      "By using the Service, you confirm that the information you provide is accurate and truthful.",
      "We do not knowingly allow minors to use the app, in compliance with Google Play and App Store age guidelines.",
      "You agree to provide accurate and complete registration information.",
      "You are responsible for maintaining the security of your account.",
      "One person may only maintain one active account.",
      "We reserve the right to suspend accounts that violate our terms.",
      "You may need to create an account. You agree to: • Provide accurate information • Keep login credentials confidential • Not impersonate others • Not create fake or duplicate accounts • Complete ID verification when required.",
      "App Store & Play Store both require truthful identity use and user safety measures."
    ],
  },
  {
    icon: Calendar,
    title: "Platform Nature & Events",
    content: [
      "UnrealVibe is not: • An event organizer • A security provider • A host • A party manager • A travel, ticketing, or entertainment company.",
      "UnrealVibe only: • Connects hosts and guests • Provides a booking interface • Provides communication and listing tools.",
      "All events listed are created, managed, and controlled solely by users.",
      "We do not guarantee: • Event quality • Safety • Legality • Guest behaviour • Alcohol, substance, or controlled-item regulations.",
      "Users must follow all applicable local laws and safety guidelines.",
      "All event bookings are subject to availability.",
      "You must follow all event rules and guidelines.",
      "Respectful behavior towards other attendees is mandatory.",
      "A booking is confirmed only after: 1. Host accepts the request 2. Payment is successfully processed."
    ],
  },
  {
    icon: AlertTriangle,
    title: "Prohibited Conduct",
    content: [
      "Harassment, discrimination, or abusive behavior of any kind.",
      "Sharing false or misleading information.",
      "Unauthorized commercial activities or solicitation.",
      "Attempting to circumvent security measures.",
      "Any illegal activities or substance abuse at events.",
      "You agree NOT to: • Misuse, hack, reverse-engineer, or copy the app • Attempt to bypass or manipulate rating, review, or booking systems • Use the platform for harassment, threats, hate, violence, or discrimination • Upload explicit adult content, pornography, or nudity • Arrange illegal events or unsafe gatherings • Promote drugs, weapons, or unlawful activities • Circumvent fees by taking bookings off-platform.",
      "Hosts must ensure: • All information is accurate • Activities comply with local laws • The venue is safe • Guests are not put at risk • House rules are clearly communicated • No misleading or harmful content is added."
    ],
  },
  {
    icon: Scale,
    title: "Liability & Safety",
    content: [
      "UnrealVibe facilitates connections but is not responsible for user interactions.",
      "We make no guarantees about event experiences or outcomes.",
      "Users participate in events at their own risk.",
      "We are not liable for any losses arising from platform use.",
      "UnrealVibe does not: • Provide safety checks • Verify attendees physically • Guarantee security, behaviour, or legality of events.",
      "Users must exercise personal judgement and caution when attending any event.",
      "UnrealVibe is not responsible for: • Personal injury • Loss or theft • Damage to property • Misconduct by users • Illegal activities by hosts or guests."
    ],
  },
  {
    icon: MessageSquare,
    title: "Communications & Content",
    content: [
      "By registering, you consent to receive service-related communications.",
      "Marketing communications require separate consent.",
      "You may opt out of non-essential communications anytime.",
      "Users may upload: • Reviews • Photos • Profiles • Event details. By uploading, you grant UnrealVibe a license to use this content for app functionality and marketing.",
      "You agree not to post: • Explicit, sexual, or pornographic content • Hate speech, threats, or harassment • Violence, self-harm, or dangerous acts • Copyright-infringing materials • Private or confidential information • Misleading content."
    ],
  }
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
              <FileText className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium uppercase tracking-wider">Legal Agreement</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using UnrealVibe. By using our service, you agree to these terms.
            </p>
            
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: December 2024
            </p>
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
                    <section.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Agreement Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                By using UnrealVibe, you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
              <p className="text-sm text-muted-foreground">
                For questions, contact{" "}
                <a href="mailto:legal@unrealvibe.com" className="text-primary hover:underline">
                  contact@unrealvibe.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;
