"use client";
import React from 'react';
import TeamLayout from '../../../components/layout/TeamLayout';
import { usePathname } from 'next/navigation';

export default function MenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Các route KHÔNG muốn hiện Pick your team
  const hideTabsRoutes = [
    '/kids/smiley-kids',
    '/kids/short-kids',
    '/kids/jersey-kids',
  ];
  const hideTabs = hideTabsRoutes.some(route => pathname.endsWith(route));
  return (
    <TeamLayout section="men" title="PICK YOUR TEAM" hideTabs={hideTabs}>
      {children}
    </TeamLayout>
  );
} 