'use client';

import { motion } from 'framer-motion';
import { SectionTag } from './ui/SectionTag';

const storyBeats = [
  {
    id: 'problem',
    tag: 'Problem',
    title: 'Without Iruka, every alert becomes bespoke watcher code.',
    content:
      'You have to decide when to check, what to evaluate, how to avoid noisy repeats, and where the alert should land.',
  },
  {
    id: 'contract',
    tag: 'Contract',
    title: 'With Iruka, triggers are explicit fields, not hidden glue code.',
    content:
      'Start with a schedule, switch to cron, or add another Iruka signal as a wake-up path. The condition and delivery stay separate.',
  },
  {
    id: 'result',
    tag: 'Result',
    title: 'Users get a cleaner rule they can read, edit, and reuse.',
    content:
      'The important parts are visible in one JSON object: when it wakes, what it checks, and where the notification goes.',
  },
];

export function Story() {
  return (
    <section id="story" className="relative py-16 md:py-24">
      <div className="page-gutter">
        <div className="mb-10 max-w-3xl">
          <SectionTag>First Principles</SectionTag>
          <h2 className="ui-section-title mt-5">Define the trigger contract instead of wiring another watcher.</h2>
          <p className="ui-copy mt-4">
            The advantage is not backend plumbing. It is that users can describe monitoring intent directly.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {storyBeats.map((beat, index) => (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="ui-panel px-5 py-5"
            >
              <div className="ui-kicker">{beat.tag}</div>
              <h3 className="mt-4 font-display text-[1.45rem] leading-none text-foreground">{beat.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-secondary">{beat.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
