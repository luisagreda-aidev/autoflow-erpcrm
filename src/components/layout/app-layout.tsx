// @/components/layout/app-layout.tsx
'use client'; // This component uses client-side hooks

import * as React from 'react';
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
import Link from 'next/link';
import { Users, Car, BarChart3, Settings } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Import usePathname
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Get the current path

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3,
  };

  return (
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
                    isActive={pathname === '/'} // Set active based on path
                  >
                    <Link href="/">
                      <Users />
                      <span>Leads & Clientes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Inventario"
                    isActive={pathname === '/inventory'} // Set active based on path
                  >
                    <Link href="/inventory">
                      <Car />
                      <span>Inventario</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Reportes"
                     isActive={pathname === '/reports'} // Set active based on path
                  >
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
                  <SidebarMenuButton
                    asChild
                    tooltip="Ajustes"
                    isActive={pathname === '/settings'} // Set active based on path
                    >
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

          {/* Ensure SidebarInset is used correctly */}
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
                 <SidebarTrigger className="hidden md:flex"/>
                 {/* Optional: Add global search or other header elements here */}
            </header>
             {/* Add AnimatePresence and motion.main for transitions */}
             <AnimatePresence mode="wait">
               <motion.main
                 key={pathname} // Important for AnimatePresence to detect route changes
                 initial="initial"
                 animate="in"
                 exit="out"
                 variants={pageVariants}
                 transition={pageTransition}
                 className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0"
                >
                {children}
              </motion.main>
             </AnimatePresence>
          </SidebarInset>
        </SidebarProvider>
  );
}
