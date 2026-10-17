import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'RadCase.gg',
  description: 'VALORANT community collection showcase',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="hu"><body style={{ margin: 0, background: '#0b0c11', color: '#f4f4f5', fontFamily: 'Inter, system-ui, sans-serif' }}>{children}</body></html>;
}
