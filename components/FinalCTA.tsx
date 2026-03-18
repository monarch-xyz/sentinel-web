'use client';

import { motion } from 'framer-motion';
import { RiGithubLine, RiDiscordLine, RiBookOpenLine } from 'react-icons/ri';
import { GridDivider } from './ui/GridDivider';

export function FinalCTA() {
  return (
    <section className="relative">
      {/* Grid divider */}
      <GridDivider rows={4} />

      <div className="py-16 md:py-24">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none"
          aria-hidden="true"
        />

        <div className="page-gutter relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto text-center"
          >
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-4">
              Stop drowning in <span className="text-[#ff6b35]">noise</span>.
            </h2>
            <p className="text-secondary mb-8">
              Set up opinionated onchain signals once, then let agents and operators work from the same source of truth.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <a
                href="https://discord.gg/Ur4dwN3aPS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] text-white text-sm font-medium rounded-md hover:bg-[#5865F2]/90 transition-colors no-underline"
              >
                <RiDiscordLine className="w-4 h-4" />
                Join Discord
              </a>
              <a
                href="https://github.com/monarch-xyz/sentinel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-secondary text-sm font-medium rounded-md hover:border-[#ff6b35]/30 hover:text-foreground transition-colors no-underline"
              >
                <RiGithubLine className="w-4 h-4" />
                GitHub
              </a>
            </div>

            {/* Docs link */}
            <a
              href="https://github.com/monarch-xyz/sentinel/blob/main/docs/ARCHITECTURE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-secondary hover:text-[#ff6b35] transition-colors"
            >
              <RiBookOpenLine className="w-4 h-4" />
              Read the docs
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
