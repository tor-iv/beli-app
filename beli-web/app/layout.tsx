import type { Metadata } from 'next';

import './globals.css';
import { Providers } from './providers';

import { Header } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Beli - Discover Great Restaurants',
  description: 'Your social restaurant discovery platform',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
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
