'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { RiBookOpenLine, RiLoginCircleLine } from 'react-icons/ri';
import { IRUKA_DOCS_OVERVIEW_URL } from '@/lib/iruka-links';

export function FinalCTA() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="page-gutter">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="ui-hero px-6 py-8 text-center sm:px-8 sm:py-10"
        >
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="ui-kicker justify-center">Start Building</div>
            <h2 className="ui-section-title mt-5">A durable signal layer for autonomous workflows.</h2>
            <p className="ui-copy mx-auto mt-4">
              Define when a signal should wake, what it should check, and where the notification should go.
              Keep the rule readable instead of spreading that intent across watcher scripts.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login" className="no-underline">
                <span className="ui-button px-5 py-3.5" data-variant="primary">
                  <RiLoginCircleLine className="h-4 w-4" />
                  Open Console
                </span>
              </Link>
              <a href={IRUKA_DOCS_OVERVIEW_URL} target="_blank" rel="noopener noreferrer" className="no-underline">
                <span className="ui-button px-5 py-3.5" data-variant="ghost">
                  <RiBookOpenLine className="h-4 w-4" />
                  Docs
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
