import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Eye, Lock, Database, UserCheck, Bell, Mail, CheckCircle, RefreshCw, Clock, AlertTriangle, Cookie, Camera, Share2, Settings, Info } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
  {
    icon: Shield, // or Lock
    title: "",
    content: [
      "Welcome to UnrealVibe. We’ve created an online space to help you discover, join, and host curated private parties and social events — making it easier than ever to meet new people and build real connections. Please take a moment to read this Privacy Policy so you can understand how we collect, use, process, and disclose your information while you navigate our Platform.",
      "We take the privacy of our users seriously. This Privacy Policy explains how UnrealVibe collects, uses, stores, and shares personal data across our website, mobile applications, and official social media accounts (collectively, the “Platform”). Our Platform may contain links to third-party websites and services that are not operated by us; UnrealVibe is not responsible for the privacy practices or content of such third-party sites.",
      "By sharing information with us — for example, when you create an account, list an event, request entry to a party, or use other features of the Platform — you agree to the terms of this Privacy Policy. If you do not agree with this policy, please do not use the Platform. If you have concerns about our practices, contact us using the details in the Contact section below; we will consider and respond to feedback.",
    ],
  },
  {
    icon: Info,
    title: "Information We Gather",
    content: [
      "To deliver our services and improve your experience on UnrealVibe, we collect information in several ways. When you interact with the Platform we may collect technical and usage information such as your IP address, device model, browser type, screen resolution, operating system, access timestamps, and referring URL. If you register, book, or list an event we also collect personal information you provide directly, including your full name, date of birth (for age verification), email address, phone number, profile photos, and password. You warrant that any personal data you provide is accurate, up-to-date, and that you have the right to provide it.",
    ],
  },
  {
    icon: Settings,
    title: "How We Use Your Data",
    content: [
      "We use the information we collect for purposes necessary to operate and improve the Platform and to provide the services you request. This includes creating and managing your account; processing bookings and payments; communicating confirmations, updates, and support messages; delivering personalized recommendations; and improving Platform performance and security. We may also use data to investigate or prevent illegal, harmful, or fraudulent activity, to enforce our Terms, and to comply with legal obligations. We do not sell your personal data to third parties. Where helpful, we may combine or aggregate data for analytical purposes in a way that does not identify you personally.",
    ],
  },
  {
    icon: Share2,
    title: "Sharing With Third Parties",
    content: [
      "We may disclose your personal data where required or permitted by law, such as in response to a lawful request by public authorities, to comply with litigation, or to protect our rights and the safety of our users. If substantially all of our assets are sold or the company is merged or acquired, user data may be transferred to the acquiring entity; in those cases we will notify you of any change in ownership and how your personal data will be handled. We may also share data with third-party service providers who perform services on our behalf — for example payment processors, hosting providers, analytics vendors, and messaging services — subject to contractual confidentiality protections. Finally, we may disclose information with any third party you explicitly ask us to connect with (for example, when you choose to sync or share content with social networks).",
    ],
  },
  {
    icon: Lock,
    title: "How We Protect Your Data",
    content: [
      "We maintain administrative, technical, and physical safeguards designed to protect your personal information from unauthorized access, disclosure, alteration, and destruction. These controls include encryption in transit and at rest, firewalls, access controls, and internal policies limiting employee access to data only to those who need it to perform their job. We also conduct security assessments and follow industry practices to help secure your information. While we work hard to protect your data, no system is impenetrable, and we cannot guarantee absolute security.",
    ],
  },
  {
    icon: Camera,
    title: "Photographs and Videos",
    content: [
      "From time to time, photographers or videographers may be present at events listed or organized through UnrealVibe to capture photos and video. If you attend an event where such media are captured, you acknowledge that those images or recordings may be used by UnrealVibe for promotional purposes, including posting on our website and social media channels, running paid or organic advertising, and printing in offline marketing materials (flyers, banners, etc.). We may also share event media with hosts for the purpose of promoting their event, subject to our host agreement.",
      "If you prefer not to be photographed or recorded, please notify the photographer or videographer at the event and contact us at [crew@unrealvibe.app] to request removal of any specific images we control. Note that photographers or videographers may sometimes be hired by hosts and not by UnrealVibe; in such cases the host is responsible for obtaining consent where required, and UnrealVibe may not have control over media captured independently by the host or their vendors.",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies and Tracking",
    content: [
      "We use cookies and similar tracking technologies (including web beacons and local storage) to recognize your device, remember your preferences, keep you signed in, improve navigation, and analyze how the Platform is used. Cookies also help us present personalized content and measure advertising effectiveness. You can usually set your browser or device to reject cookies, but some Platform features may not function properly without them. Our use of cookies is limited to the Platform; we are not responsible for cookies set by third-party sites linked from our Platform.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Phishing and Fraud",
    content: [
      "If you receive an unsolicited email or message that appears to be from UnrealVibe requesting sensitive personal information (such as passwords, one-time codes, or full credit card details), do not respond and do not click any links. We do not request such sensitive information by email. If you receive suspicious communications claiming to be from UnrealVibe or from an event host on our Platform, forward the message to [crew@unrealvibe.app] and delete it. Your prompt report helps protect other users.",
    ],
  },
  {
    icon: Clock,
    title: "Data Retention",
    content: [
      "We retain personal data for as long as necessary to provide the services you request, to comply with legal obligations, to resolve disputes, enforce agreements, and for internal operational needs such as analytics and fraud prevention. When data is no longer required for a legitimate business or legal purpose, we either delete it or anonymize it so that it can no longer be associated with you.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Changes to This Policy",
    content: [
      "UnrealVibe reserves the right to update this Privacy Policy at our discretion. We will endeavor to notify you of material changes — for example by posting a prominent notice on the Platform or sending an email — but you should review this page periodically. Continued use of the Platform after changes are posted constitutes acceptance of the revised policy.",
    ],
  },
  {
    icon: CheckCircle,
    title: "Your Consent",
    content: [
      "By using the UnrealVibe Platform, registering an account, or providing personal information, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with our practices, please do not use the Platform or provide personal data.",
    ],
  },
  {
    icon: Mail,
    title: "Contact",
    content: [
      "If you have questions, requests, or concerns about this Privacy Policy or our privacy practices, please contact us at:",
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
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium uppercase tracking-wider">Your Privacy Matters</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to protecting your personal information and being transparent about how we use it.
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

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about our privacy practices, please contact us.
              </p>
              <a
                href="mailto:privacy@unrealvibe.com"
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

export default PrivacyPolicy;
