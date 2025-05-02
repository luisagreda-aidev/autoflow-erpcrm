import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Users, Car, BarChart3, Settings } from 'lucide-react';
import Image from 'next/image';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

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
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader className="flex items-center justify-between gap-2">
                {/* Removed the icon wrapper */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
                        AutoFlow
                    </span>
                </Link>
              <SidebarTrigger className="md:hidden" />
            </SidebarHeader>

            <SidebarContent className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Leads"
                    isActive={true} // Example: Make Leads active by default
                  >
                    <Link href="/">
                      <Users />
                      <span>Leads & Clientes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Inventario">
                    <Link href="/inventory">
                      <Car />
                      <span>Inventario</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Reportes">
                    <Link href="/reports">
                      <BarChart3 />
                      <span>Reportes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Ajustes">
                    <Link href="/settings">
                      <Settings />
                      <span>Ajustes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Placeholder User Profile */}
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" tooltip="Perfil">
                        <Image
                            src="https://picsum.photos/40/40"
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="rounded-full"
                            data-ai-hint="user avatar"
                         />
                        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-medium">Admin User</span>
                            <span className="text-xs text-muted-foreground">admin@autoflow.com</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
                 <SidebarTrigger className="hidden md:flex"/>
                 {/* Optional: Add global search or other header elements here */}
            </header>
            <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
