'use client';

import { motion } from 'framer-motion';
import { RiRobot2Line } from 'react-icons/ri';
import { SectionTag } from './ui/SectionTag';
import { GridDivider } from './ui/GridDivider';

const agentCode = `app.post('/megabat-webhook', async (req, res) => {
  const {
    signal_id,
    signal_name,
    triggered_at,
    scope,
    conditions_met,
    context,
  } = req.body;

  await routeSignal({
    signalId: signal_id,
    signalName: signal_name,
    triggeredAt: triggered_at,
    chainId: context?.chain_id,
    marketId: context?.market_id,
    address: context?.address,
    scope,
    matchedConditions: conditions_met,
  });

  res.status(200).send('OK');
});`;

export function ForAgents() {
  return (
    <section id="for-agents" className="relative">
      <GridDivider rows={4} />
      
      <div className="py-16 md:py-24">
        <div className="page-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <SectionTag>Agent Senses</SectionTag>
              
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-4 mb-4">
                Give your agent a <span className="text-[#ff6b35]">detection layer</span>.
              </h2>
              
              <p className="text-secondary leading-relaxed mb-6">
                Megabat works naturally with agents because the DSL is structured enough for them to express what
                should register, and the runtime is durable enough to keep watch after they stop polling. Agents can
                combine metric sugar, raw state refs, indexed metrics, and raw event scans, then route actions from
                the structured context Megabat returns.
              </p>

              <ul className="space-y-3 text-secondary">
                <li className="flex items-center gap-3">
                  <RiRobot2Line className="w-5 h-5 text-[#ff6b35]" />
                  <span>One detection surface across state, indexed, and raw sources</span>
                </li>
                <li className="flex items-center gap-3">
                  <RiRobot2Line className="w-5 h-5 text-[#ff6b35]" />
                  <span>Webhook payloads with exact scope, matched conditions, and context</span>
                </li>
                <li className="flex items-center gap-3">
                  <RiRobot2Line className="w-5 h-5 text-[#ff6b35]" />
                  <span>Continuous watch without bespoke polling loops and filters</span>
                </li>
              </ul>
            </motion.div>

            {/* Right - code example */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative rounded-lg overflow-hidden border border-border">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-xs text-secondary ml-2">webhook-handler.js</span>
                </div>
                <pre className="p-4 bg-background text-sm overflow-x-auto">
                  <code className="font-mono text-secondary leading-relaxed whitespace-pre">
                    {agentCode}
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
