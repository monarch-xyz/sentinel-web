'use client';

import { motion } from 'framer-motion';
import { RiCodeSSlashLine, RiCloudLine, RiNotification3Line } from 'react-icons/ri';

const steps = [
  {
    icon: RiCodeSSlashLine,
    title: 'Define',
    description: 'Model conditions as dynamic queries across metrics, thresholds, and windows with composable logic.',
    code: `"window": { "duration": "7d" }
"conditions": [
  { "type": "change", "metric": "Morpho.Position.supplyShares", "direction": "decrease", "by": { "percent": 20 }, "chain_id": 1, "market_id": "0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41" },
  { "type": "threshold", "metric": "Morpho.Market.utilization", "operator": ">", "value": 0.9, "chain_id": 1, "market_id": "0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41" }
]`,
  },
  {
    icon: RiCloudLine,
    title: 'Deploy',
    description: 'Register your query via API once. Sentinel continuously evaluates state changes and smart filters.',
    code: `POST /api/v1/signals
X-API-Key: sentinel_...
{ "name": "High-Signal Watch",
  "repeat_policy": { "mode": "cooldown" },
  ... }`,
  },
  {
    icon: RiNotification3Line,
    title: 'React',
    description: 'Receive webhooks only when all relevant conditions are met, so your agent acts on signal, not noise.',
    code: `→ POST your-webhook-url
{ "triggered": true,
  "conditions_met": [],
  "context": { "chain_id": 1 } }`,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-surface" />
      <div
        className="absolute inset-0 bg-line-grid opacity-30 pointer-events-none"
        aria-hidden="true"
      />

      <div className="page-gutter relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-zen text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Three Steps to <span className="text-[#ff6b35]">Signal-First Automation</span>
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Compose valid DSL conditions, deploy once, and react only to alerts that matter.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              className="relative group"
            >
              {/* Step number */}
              <motion.div 
                className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-7 h-7 md:w-8 md:h-8 bg-[#ff6b35] rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg shadow-[#ff6b35]/30 z-10"
                whileHover={{ scale: 1.1 }}
              >
                {index + 1}
              </motion.div>

              {/* Card */}
              <div className="bg-background rounded-lg p-5 md:p-6 border border-border h-full transition-all duration-300 hover:border-[#ff6b35]/30 hover:shadow-lg hover:shadow-[#ff6b35]/5 group-hover:translate-y-[-2px]">
                <step.icon className="w-8 h-8 md:w-10 md:h-10 text-[#ff6b35] mb-3 md:mb-4" />
                <h3 className="font-zen text-lg md:text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-secondary mb-4 text-sm leading-relaxed">{step.description}</p>
                
                {/* Mini code block with Sentinel syntax colors */}
                <div className="relative text-xs bg-[#0d1117] rounded-md p-3 overflow-x-auto font-mono custom-scrollbar border border-[#30363d] group-hover:border-[#ff6b35]/20 transition-colors">
                  <div className="absolute inset-0 bg-[#ff6b35]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none" />
                  
                  {step.code.split('\n').map((line, i) => (
                    <div key={i} className="whitespace-nowrap relative">
                      {line.startsWith('POST') || line.startsWith('→') ? (
                        // HTTP method or arrow
                        <>
                          <span className="text-[#7ee787]">{line.split(' ')[0]}</span>
                          <span className="text-[#e6edf3]"> {line.split(' ').slice(1).join(' ')}</span>
                        </>
                      ) : line.startsWith('Authorization') ? (
                        // Header
                        <>
                          <span className="text-[#ff7b72]">{line.split(':')[0]}</span>
                          <span className="text-[#8b949e]">:</span>
                          <span className="text-[#a5d6ff]">{line.split(':').slice(1).join(':')}</span>
                        </>
                      ) : line.startsWith('X-API-Key') ? (
                        <>
                          <span className="text-[#ff7b72]">{line.split(':')[0]}</span>
                          <span className="text-[#8b949e]">:</span>
                          <span className="text-[#a5d6ff]">{line.split(':').slice(1).join(':')}</span>
                        </>
                      ) : line.startsWith('"') ? (
                        // JSON key-value
                        <>
                          <span className="text-[#ff6b35]">{line.split(':')[0]}</span>
                          {line.includes(':') && (
                            <>
                              <span className="text-[#8b949e]">:</span>
                              <span className="text-[#ff9f1c]">{line.split(':').slice(1).join(':')}</span>
                            </>
                          )}
                        </>
                      ) : line.startsWith('{') || line.startsWith('}') ? (
                        // Brackets
                        <span className="text-[#8b949e]">{line}</span>
                      ) : (
                        // Default
                        <span className="text-[#e6edf3]">{line}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector line - vertical on mobile, horizontal on desktop */}
              {index < steps.length - 1 && (
                <>
                  {/* Mobile connector (vertical) */}
                  <div className="md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#ff6b35]/40" />
                  {/* Desktop connector (horizontal) */}
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#ff6b35]/40" />
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
