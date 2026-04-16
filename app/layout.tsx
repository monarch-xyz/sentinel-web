import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, JetBrains_Mono, EB_Garamond } from 'next/font/google';
import './globals.css';
import { WagmiProviders } from '@/components/auth/WagmiProviders';

// Self-hosted fonts via next/font (eliminates render-blocking requests)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

// EB Garamond for elegant headings - sovereignty/narrative vibe
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const DEFAULT_SITE_URL = 'https://megabat.monarchlend.xyz';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getRequestSiteUrl = async () => {
  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');
  if (!host) {
    return DEFAULT_SITE_URL;
  }

  const forwardedProto = headerStore.get('x-forwarded-proto');
  const protocol =
    forwardedProto ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return trimTrailingSlash(`${protocol}://${host}`);
};

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Megabat - The Sensing Layer for DeFi Agents',
      template: '%s | Megabat',
    },
    description:
      'Megabat watches RPC state, indexed history, and raw events continuously, then emits structured signals only when the pattern you defined actually matches. Built by Monarch.',
    keywords: [
      'DeFi',
      'DeFi monitoring',
      'blockchain alerts',
      'crypto signals',
      'state monitoring',
      'indexed history',
      'raw events',
      'archive rpc',
      'signal DSL',
      'state_ref',
      'position monitoring',
      'webhook alerts',
      'telegram alerts',
      'defi automation',
      'blockchain signals',
    ],
    authors: [{ name: 'Monarch', url: 'https://monarchlend.xyz' }],
    creator: 'Monarch',
    publisher: 'Monarch',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: 'Megabat - The Sensing Layer for DeFi Agents',
      description: 'Megabat keeps watch across state, indexed history, and raw events, then emits structured signals only when the pattern matches.',
      url: siteUrl,
      siteName: 'Megabat by Monarch',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Megabat - The sensing layer for DeFi agents',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Megabat - The Sensing Layer for DeFi Agents',
      description: 'Megabat keeps watch across state, indexed history, and raw events, then emits structured signals only when the pattern matches.',
      creator: '@monarchxyz',
      site: '@monarchxyz',
      images: [
        {
          url: `${siteUrl}/twitter-image`,
          alt: 'Megabat - The sensing layer for DeFi agents',
        },
      ],
    },
    alternates: {
      canonical: siteUrl,
    },
    category: 'technology',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = await getRequestSiteUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Megabat',
    description: 'A sensing layer for DeFi agents across RPC state, indexed history, and raw events.',
    url: siteUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'Monarch',
      url: 'https://monarchlend.xyz',
    },
    keywords: 'DeFi, blockchain monitoring, signals, archive RPC, indexed history, raw events',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#16181a" />
        <meta name="color-scheme" content="dark" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${ebGaramond.variable} font-inter antialiased`} suppressHydrationWarning>
        <WagmiProviders>
          {children}
        </WagmiProviders>
      </body>
    </html>
  );
}
