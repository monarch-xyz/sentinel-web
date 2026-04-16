'use client';

import Link from 'next/link';
import { RiGithubFill, RiDiscordFill, RiBookLine, RiExternalLinkLine, RiRadarLine } from 'react-icons/ri';
import { MEGABAT_GITHUB_URL, MEGABAT_SITE_DOCS_PATH } from '@/lib/megabat-links';

const links = [
  { href: MEGABAT_SITE_DOCS_PATH, label: 'Docs', icon: RiBookLine, external: false },
  { href: MEGABAT_GITHUB_URL, label: 'GitHub', icon: RiGithubFill, external: true },
  { href: 'https://discord.gg/Ur4dwN3aPS', label: 'Discord', icon: RiDiscordFill, external: true },
];

export function Footer() {
  return (
    <footer className="relative py-12 border-t border-border">
      <div className="page-gutter">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <RiRadarLine className="h-6 w-6 text-[#ff6b35]" />
              <span className="font-serif text-xl font-medium text-foreground">Megabat</span>
            </Link>
            <p className="text-secondary text-sm font-serif italic">The sensing layer for DeFi agents</p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex items-center gap-2 text-secondary hover:text-foreground transition-colors no-underline"
                >
                  <link.icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm hidden sm:inline">{link.label}</span>
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="flex items-center gap-2 text-secondary hover:text-foreground transition-colors no-underline"
                >
                  <link.icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm hidden sm:inline">{link.label}</span>
                </Link>
              )
            ))}
          </div>

          {/* Built by Monarch */}
          <a
            href="https://monarchlend.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-border hover:border-[#ff6b35]/30 transition-colors no-underline group"
          >
            <span className="text-sm text-secondary group-hover:text-foreground">Built by</span>
            <span className="font-serif font-medium text-[#f45f2d]">Monarch</span>
            <RiExternalLinkLine className="w-4 h-4 text-secondary" />
          </a>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-secondary text-sm">
            © {new Date().getFullYear()} Monarch. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
