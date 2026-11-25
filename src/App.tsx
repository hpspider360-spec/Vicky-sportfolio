import { useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Hero } from './hero/Hero';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { EducationSection } from './components/EducationSection';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { AdminPortal } from './components/AdminPortal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PortfolioProvider } from './context/PortfolioContext';

function PortfolioAppContent() {
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const handleAdminTreeTrigger = useCallback(() => {
    setAdminUnlocked(true);
    setAdminOpen(true);
  }, []);

  const handleOpenAdmin = useCallback(() => {
    setAdminOpen(true);
  }, []);

  const handleCloseAdmin = useCallback(() => {
    setAdminOpen(false);
  }, []);

  return (
    <div
      id="top"
      className="min-h-screen w-full bg-[#121216] text-[#F4F4F6] antialiased selection:bg-[#C8FF2E] selection:text-[#121216]"
    >
      <a
        href="#intro"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:border focus:border-[#C8FF2E] focus:bg-[#121216] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-[#C8FF2E]"
      >
        Skip to portfolio content
      </a>

      {/* Full-viewport 3D animated studio hero shown first on arrival, fading out on scroll */}
      <Hero
        adminLinkUnlocked={adminUnlocked}
        onAdminTreeTrigger={handleAdminTreeTrigger}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Sticky navigation bar locks to the top as the visitor scrolls into the portfolio */}
      <Navbar adminLinkUnlocked={adminUnlocked} onOpenAdmin={handleOpenAdmin} />

      <main id="main-content">
        <HeroSection />
        <ProjectsSection />
        <EducationSection />
        <SkillsSection />
        <ExperienceSection />
      </main>

      <ContactSection />

      {/* Owner-only Admin Portal unlocked via the hidden 3D tree gesture */}
      <AdminPortal open={adminOpen} onClose={handleCloseAdmin} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PortfolioProvider>
        <MotionConfig reducedMotion="user">
          <PortfolioAppContent />
        </MotionConfig>
      </PortfolioProvider>
    </ErrorBoundary>
  );
}
