import { Helmet } from "react-helmet-async";
import { Header } from "@/frontend/components/Header";
import { Footer } from "@/frontend/components/Footer";
import { MobileBottomNav } from "@/frontend/components/MobileBottomNav";
import { AboutSection } from "@/frontend/components/AboutSection";
import { WhyChooseUsSection } from "@/frontend/components/WhyChooseUsSection";
import { ServicesSection } from "@/frontend/components/ServicesSection";
import { ImpactCountersSection } from "@/frontend/components/ImpactCountersSection";
import { BrandStrip } from "@/frontend/components/BrandStrip";
import { useStore } from "@/frontend/context/StoreContext";
import { useHomeContent } from "@/hooks/useHomeContent";
import { Building2, MapPin, Phone, Mail, Award } from "lucide-react";

export const AboutPage = () => {
  const { company } = useStore();
  const { content } = useHomeContent();
  const companyName = company?.name || "Eon Technology Pvt. Ltd.";

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0 flex flex-col">
      <Helmet>
        <title>{`About Us | ${companyName} - Premier IT & Security Distributor in Nepal`}</title>
        <meta
          name="description"
          content={`Learn about ${companyName}, authorized technology distributor in Nepal. World-class IT, Security, Networking & Audio solutions with official warranty support.`}
        />
      </Helmet>

      <Header />

      <main className="flex-1">
        {/* Page Hero Header */}
        <div className="bg-[#0c1017] text-white py-14 sm:py-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="section-pre-title text-white">ABOUT OUR COMPANY</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Powering Nepal’s Technology Distribution
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Connecting global hardware manufacturers with Nepal's authorized dealer ecosystem, system integrators, and enterprise clients.
            </p>
          </div>
        </div>

        {/* 1. Brand Foundation / About Us */}
        <AboutSection />

        {/* 2. Impact Counters */}
        <ImpactCountersSection />

        {/* 3. Why Choose Us */}
        <WhyChooseUsSection />

        {/* 4. Authorized Services & RMA Hub */}
        <ServicesSection />

        {/* 5. Corporate Headquarters / Contact strip */}
        <section className="py-12 bg-accent/30 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Corporate Headquarters</h4>
                  <p className="text-xs text-muted-foreground mt-1">Ganabahal, Kathmandu, Nepal</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">B2B Channel Inquiries</h4>
                  <p className="text-xs text-muted-foreground mt-1">+977 9841911857 / 9801492210</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Award size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Authorized Brands</h4>
                  <p className="text-xs text-muted-foreground mt-1">Dahua, CP Plus, Ant Esports, Intex, Bestor</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Authorized Brand Strip */}
        <BrandStrip />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default AboutPage;
