import type { Metadata } from 'next';

import './globals.css';
import { Providers } from './providers';

import { Header } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Beli - Restaurant Discovery Platform',
  description: 'Built to demonstrate my interest in joining the beli team and showcase full-stack development skills. Features include Tastemakers (NYC food experts with badges), Group Dinner AI matching, What to Order recommendations, social feeds, and leaderboards. Built with React Native + Next.js + TypeScript.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Beli - Restaurant Discovery Platform',
    description: 'Built to demonstrate my interest in joining the beli team and showcase full-stack development skills. Features include Tastemakers (NYC food experts with badges), Group Dinner AI matching, What to Order recommendations, social feeds, and leaderboards. Built with React Native + Next.js + TypeScript.',
    url: 'https://belihire.me',
    siteName: 'Beli',
    images: [
      {
        url: 'https://belihire.me/beli-logo.webp',
        width: 800,
        height: 600,
        alt: 'Beli Restaurant Discovery Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beli - Restaurant Discovery Platform',
    description: 'Built to demonstrate my interest in joining the beli team and showcase full-stack development skills. Features include Tastemakers (NYC food experts with badges), Group Dinner AI matching, What to Order recommendations, social feeds, and leaderboards. Built with React Native + Next.js + TypeScript.',
    images: ['https://belihire.me/beli-logo.webp'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
