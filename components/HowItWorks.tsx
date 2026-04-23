'use client';

import { motion } from 'framer-motion';

const triggerCards = [
  {
    title: 'Interval schedule',
    description: 'Wake the signal every N seconds for simple recurring checks.',
    example: 'schedule.kind = interval',
  },
  {
    title: 'UTC cron schedule',
    description: 'Wake the signal at a specific UTC cadence when timing matters.',
    example: 'schedule.kind = cron',
  },
  {
    title: 'Iruka signal',
    description: 'Let one signal wake another without changing either signal definition.',
    example: 'type = iruka_signal',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24">
      <div className="page-gutter">
        <div className="mx-auto max-w-3xl text-center">
          <div className="ui-kicker justify-center">Public Schema</div>
          <h2 className="ui-section-title mt-5">Define one signal with one or more wake-up paths.</h2>
          <p className="ui-copy mx-auto mt-4">
            Triggers decide when to wake. Definition decides what to check. Delivery decides where the alert goes.
          </p>
        </div>

        <motion.div
          className="mt-10 grid gap-4 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {triggerCards.map((card) => (
            <motion.div
              key={card.title}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
              className="ui-panel p-5"
            >
              <div className="ui-kicker">{card.example}</div>
              <h3 className="mt-4 font-display text-[1.45rem] leading-none text-foreground">{card.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-secondary">{card.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-secondary">
          Telegram delivery is configured separately, so notification routing does not change the trigger or the definition.
        </div>
      </div>
    </section>
  );
}
