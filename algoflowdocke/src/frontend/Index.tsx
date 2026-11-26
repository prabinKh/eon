import { Helmet } from "react-helmet-async";
import { Header } from "@/frontend/components/Header";
import { Footer } from "@/frontend/components/Footer";
import { MobileBottomNav } from "@/frontend/components/MobileBottomNav";
import { HeroSection } from "@/frontend/components/HeroSection";
import { HeroQuickCards } from "@/frontend/components/HeroQuickCards";
import { AboutSection } from "@/frontend/components/AboutSection";
import { WhyChooseUsSection } from "@/frontend/components/WhyChooseUsSection";
import { SolutionsShowcaseSection } from "@/frontend/components/SolutionsShowcaseSection";
import { ServicesSection } from "@/frontend/components/ServicesSection";
import { ImpactCountersSection } from "@/frontend/components/ImpactCountersSection";
import { BrandStrip } from "@/frontend/components/BrandStrip";
import OfferBanner from "@/frontend/components/OfferBanner";
import { useStore } from "@/frontend/context/StoreContext";

const Index = () => {
  const { company } = useStore();
  const companyName = company?.name || "Eon Technology";

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0 flex flex-col">
      <Helmet>
        <title>{`${companyName} | Nepal’s Leading ICT & Consumer Electronic Distributor`}</title>
        <meta 
          name="description" 
          content={`${companyName} is Nepal’s leading ICT & electronics distributor. From laptops to servers, surveillance, and optical networking, we power innovation with global brands.`} 
        />
        <meta 
          name="keywords" 
          content="Server, Dell Cloud, Dahua, CP Plus, Ant Esports, Intex, Bestor, storage, data center, ONT, surveillance, router, networking tool, cyber security, Nepal ICT" 
        />
        <link rel="canonical" href={window.location.origin} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={`${companyName} | Nepal’s Leading ICT & Consumer Electronic Distributor`} />
        <meta property="og:description" content="At the frontier of Technology, Marketing, Distribution and Services in Nepal." />
        <meta property="og:url" content={window.location.origin} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={company?.logo || "/eontechnology-logo.png"} />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": companyName,
            "url": window.location.origin,
            "logo": company?.logo || `${window.location.origin}/eontechnology-logo.png`,
            "description": "Nepal’s Leading ICT & Consumer Electronic Distributor and Infrastructure Provider."
          })}
        </script>
      </Helmet>

      {/* Main Header / Navigation */}
      <Header />

      <main className="flex-1">
        {/* 1. Hero Banner */}
        <HeroSection />

        {/* 2. Floating Quick Cards */}
        <HeroQuickCards />

        {/* 3. Special Offer Banner (if configured) */}
        <OfferBanner />

        {/* 4. Products & Solutions Showcase (Neoteric Split Layout) */}
        <SolutionsShowcaseSection />

        {/* 5. Corporate About Us / Brand Foundation */}
        <AboutSection />

        {/* 6. Why Choose Us? (Engineering & Distribution Excellence) */}
        <WhyChooseUsSection />

        {/* 7. Authorized Technical Services */}
        <ServicesSection />

        {/* 8. Live Numbers & Impact Counters */}
        <ImpactCountersSection />

        {/* 9. Authorized Global Brand Ecosystem */}
        <BrandStrip />
      </main>

      {/* Footer & Mobile Bottom Bar */}
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
