// apps/web/app/layout.tsx
import type { Metadata } from 'next';
// If you have Tailwind/global styles, keep this import (optional)
import './globals.css';

export const metadata: Metadata = {
  title: 'psychology.me',
  description: 'MVP bootstrap',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}




