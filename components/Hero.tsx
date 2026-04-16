'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { RiArrowDownLine } from 'react-icons/ri';
import { GridAccent } from './ui/GridAccent';
import { SectionTag } from './ui/SectionTag';
import { MEGABAT_SITE_DOCS_PATH } from '@/lib/megabat-links';

export function Hero() {
  const scrollToSection = () => {
    const element = document.getElementById('story');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col pt-14 md:pt-16">
      {/* Dot grid background with radial fade */}
      <div
        className="absolute inset-0 bg-dot-grid pointer-events-none opacity-60"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 70% at 30% 40%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 30% 40%, black 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Grid accent top-right */}
      <GridAccent position="top-right" variant="dots" size="lg" />

      {/* Content */}
      <div className="flex-1 flex items-center relative z-10">
        <div className="page-gutter">
          <div className="max-w-3xl">
            {/* Section tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <SectionTag>Continuous Detection</SectionTag>
            </motion.div>

            {/* Opening line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-lg text-secondary mb-4 italic"
            >
              State, indexed, and raw conditions in one watch loop.
            </motion.p>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8"
            >
              Watch for the
              <br />
              <span className="text-[#ff6b35]">exact move that matters</span>.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-secondary max-w-xl mb-10 leading-relaxed"
            >
              Megabat continuously watches RPC state, indexed history, and raw events, then emits a structured
              signal only when your pattern matches.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={scrollToSection}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6b35] text-white text-sm font-medium rounded-md hover:bg-[#ff6b35]/90 transition-colors"
              >
                See How It Works
                <RiArrowDownLine className="w-4 h-4" />
              </button>
              <Link
                href={MEGABAT_SITE_DOCS_PATH}
                className="inline-flex items-center justify-center px-6 py-3 border border-border text-secondary text-sm font-medium rounded-md hover:border-[#ff6b35]/30 hover:text-foreground transition-colors no-underline"
              >
                Read Docs
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border border-secondary/30 rounded-full flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 bg-[#ff6b35] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
