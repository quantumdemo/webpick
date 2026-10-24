import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WebPicks - Pick the System. Remake the Web.',
  description: 'Ethical Design System Extractor and Website Remake Studio. Extract clean design tokens and export Next.js 15 + Tailwind CSS components.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0B0E] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
