import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { IdleTimeoutProvider } from '@/components/idle-timeout-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ZenBank',
  description: 'A modern ATM simulation experience',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-body antialiased ${inter.variable}`}>
        <AuthProvider>
          <IdleTimeoutProvider>
            {children}
            <Toaster />
          </IdleTimeoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
