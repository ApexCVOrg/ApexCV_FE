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
    '/men/hoodie',
    '/men/jacket',
    '/men/shorttrouser',
    '/men/Jersey',
    'men/team-sneaker'
  ];
  const hideTabs = hideTabsRoutes.some(route => pathname.endsWith(route));
  return (
    <TeamLayout section="men" title="PICK YOUR TEAM" hideTabs={hideTabs}>
      {children}
    </TeamLayout>
  );
} 