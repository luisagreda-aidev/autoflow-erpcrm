// @/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/layout/app-layout'; // Import the new client layout component
import { Toaster } from '@/components/ui/toaster';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Metadata can now be exported correctly from the server component
export const metadata: Metadata = {
  title: 'AutoFlow CRM',
  description: 'CRM for Car Dealerships',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        {/* Use the client component for layout structure */}
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
