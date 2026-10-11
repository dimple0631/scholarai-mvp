import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'ScholarAI — Your study-abroad plan, made clear',
  description: 'Explore study opportunities, understand the real cost, and keep applications on track.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
