'use client';

import { motion } from 'framer-motion';
import { RiArrowRightLine } from 'react-icons/ri';
import { Button } from './ui/Button';
import { SENTINEL_API_DOCS_URL } from '@/lib/sentinel-links';

const endpoints = [
  {
    method: 'GET',
    path: '/health',
    description: 'Check source-family capability status for state, indexed, and raw.',
  },
  {
    method: 'GET',
    path: '/chains',
    description: 'Inspect the configured runtime chain allowlist and archive RPC setup.',
  },
  {
    method: 'GET',
    path: '/api/v1/catalog',
    description: 'Read the backend-supported raw-event template catalog for builder UX.',
  },
  {
    method: 'POST',
    path: '/api/v1/signals',
    description: 'Create a signal from the current DSL, including repeat policy, state aliases, and raw-events definitions.',
  },
  {
    method: 'POST',
    path: '/api/v1/simulate/:id/simulate',
    description: 'Run a time-range simulation for an existing signal before turning it on.',
  },
];

const getMethodClassName = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-green-500/10 text-green-500';
    case 'POST':
      return 'bg-blue-500/10 text-blue-500';
    case 'PATCH':
      return 'bg-amber-500/10 text-amber-600';
    default:
      return 'bg-red-500/10 text-red-500';
  }
};

export function ApiReference() {
  return (
    <section id="api" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-surface" />

      <div className="page-gutter relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-zen text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Simple <span className="text-[#ff6b35]">REST API</span>
            </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
              Core routes for capability checks, raw-event catalog discovery, signal lifecycle, and simulation.
          </p>
          </motion.div>

          {/* API table - desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden sm:block bg-background rounded-lg border border-border overflow-hidden mb-8"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary">Method</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary">Endpoint</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-secondary">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint, index) => (
                    <motion.tr 
                      key={index} 
                      className="border-b border-border last:border-0 hover:bg-hovered transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-mono font-medium ${getMethodClassName(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-[#ff6b35]">{endpoint.path}</code>
                      </td>
                      <td className="px-6 py-4 text-secondary text-sm">
                        {endpoint.description}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* API cards - mobile */}
          <div className="sm:hidden space-y-3 mb-8">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-background rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-mono font-medium ${getMethodClassName(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-[#ff6b35]">{endpoint.path}</code>
                </div>
                <p className="text-secondary text-sm">{endpoint.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <a
              href={SENTINEL_API_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline inline-block"
            >
              <Button variant="primary" size="lg" className="font-zen">
                Full API Documentation
                <RiArrowRightLine className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
