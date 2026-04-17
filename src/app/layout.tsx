import type { Metadata } from 'next';
import './globals.css';
import NeonAuthProvider from '@/components/providers/NeonAuthProvider';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Fitness Dashboard',
  description: 'Personal fitness tracking dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NeonAuthProvider>
          <AppShell>{children}</AppShell>
        </NeonAuthProvider>
      </body>
    </html>
  );
}
