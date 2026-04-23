'use client';

import { motion } from 'framer-motion';
import { SectionTag } from './ui/SectionTag';

type UseCase = {
  id: string;
  title: string;
  summary: string;
};

const useCases: UseCase[] = [
  {
    id: 'net-flow-agent',
    title: 'Net flow watch',
    summary: 'Track inbound minus outbound value without writing log scanners.',
  },
  {
    id: 'holder-cluster',
    title: 'Holder cluster change',
    summary: 'Detect coordinated ERC-4626 owner movement with grouped state checks.',
  },
  {
    id: 'signal-chain',
    title: 'Signal-to-signal workflow',
    summary: 'Let one signal wake another when a workflow needs multiple stages.',
  },
];

export function Capabilities() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="page-gutter">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTag>What You Can Build</SectionTag>
          <h2 className="ui-section-title mt-5">Readable monitoring rules without watcher scripts.</h2>
          <p className="ui-copy mx-auto mt-4">
            Use the same signal shape for different monitoring patterns: define when it wakes, what it checks, and where it notifies.
          </p>
        </div>

        <motion.div
          className="mt-10 grid gap-4 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.id}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
              className="ui-panel p-5"
            >
              <div className="ui-kicker">Pattern</div>
              <h3 className="mt-4 font-display text-[1.45rem] leading-none text-foreground">{useCase.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-secondary">{useCase.summary}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
