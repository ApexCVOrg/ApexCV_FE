'use client';

import React from 'react';
import TeamLayout from '../../../components/layout/TeamLayout';
import { usePathname } from 'next/navigation';

export default function WomenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Các route KHÔNG muốn hiện Pick your team
  const hideTabsRoutes = [
    '/women/jacket-women',
    '/women/shorttrouser-women',
    '/women/Jersey-women',
    '/women/team-sneaker',
    '/women/hoodie-women'
  ];
  const hideTabs = hideTabsRoutes.some(route => pathname.endsWith(route));
  
  // Nếu là trang sử dụng GenderPageLayout, chỉ render children
  if (hideTabs) {
    return <>{children}</>;
  }
  
  return (
    <TeamLayout section="women" title="PICK YOUR TEAM" hideTabs={hideTabs}>
      {children}
    </TeamLayout>
  );
} 