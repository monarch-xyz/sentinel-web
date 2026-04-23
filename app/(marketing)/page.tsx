import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Story } from '@/components/Story';
import { HowItWorks } from '@/components/HowItWorks';
import { Features } from '@/components/Features';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';

export default function MarketingHome() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <Hero />
        <Story />
        <HowItWorks />
        <Features />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
