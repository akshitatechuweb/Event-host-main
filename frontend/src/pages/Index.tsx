import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ChristmasParty } from "@/components/ChristmasParty";
import { TransformSection } from "@/components/TransformSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ChristmasParty />
      <TransformSection />
      <HowItWorks />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default Index;
