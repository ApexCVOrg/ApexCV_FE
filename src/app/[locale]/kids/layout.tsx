"use client";
import React from 'react';
import TeamLayout from '../../../components/layout/TeamLayout';
import { usePathname } from 'next/navigation';

export default function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Các route KHÔNG muốn hiện Pick your team
  const hideTabsRoutes = [
    '/kids/smiley-kids',
    '/kids/tracksuit',
    '/kids/jersey',
    '/kids/team-sneaker'
  ];
  const hideTabs = hideTabsRoutes.some(route => pathname.endsWith(route));
  
  // Nếu là trang sử dụng GenderPageLayout, chỉ render children
  if (hideTabs) {
    return <>{children}</>;
  }
  
  return (
    <TeamLayout section="kids" title="PICK YOUR TEAM" hideTabs={hideTabs}>
      {children}
    </TeamLayout>
  );
} 