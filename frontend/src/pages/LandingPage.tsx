
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';



export const LandingPage = () => {


  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Enhanced Navigation with Better Hover Effects */}
      <LandingNavbar />

      {/* Main Sections */}
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};