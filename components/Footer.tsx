'use client';

import { RiArrowRightUpLine, RiBookLine, RiDiscordFill, RiExternalLinkLine } from 'react-icons/ri';
import { IRUKA_DOCS_OVERVIEW_URL } from '@/lib/iruka-links';

const links = [
  { href: IRUKA_DOCS_OVERVIEW_URL, label: 'Docs', icon: RiBookLine, external: true },
  { href: 'https://discord.gg/Ur4dwN3aPS', label: 'Discord', icon: RiDiscordFill, external: true },
];

export function Footer() {
  return (
    <footer className="relative pb-10 pt-14">
      <div className="page-gutter">
        <div className="ui-panel px-6 py-8 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
            <div className="space-y-4">
              <div className="ui-kicker">Iruka</div>
              <div>
                <h2 className="ui-section-title max-w-xl">A signal layer that helps agents get smarter from open data.</h2>
                <p className="ui-copy mt-4">
                  Define the condition once. Let Iruka keep evaluating state, indexed history,
                  and raw events until open data resolves into something your agent can actually use.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-option flex items-center justify-between px-4 py-3 no-underline"
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <link.icon className="h-4 w-4 text-[color:var(--signal-copper)]" />
                    {link.label}
                  </span>
                  <RiArrowRightUpLine className="h-4 w-4 text-[color:var(--ink-muted)]" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 text-sm text-secondary md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Iruka. Open data signals for agent-ready monitoring.</p>
            <a
              href="https://iruka.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="ui-link inline-flex items-center gap-2 no-underline"
            >
              iruka.tech
              <RiExternalLinkLine className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
