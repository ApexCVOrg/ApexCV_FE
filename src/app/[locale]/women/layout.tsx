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
    '/women/thun-croptop',
    '/women/hoodie-women',
    '/women/sportswear-women',
    '/women/trousers-women',
    '/women/leggings-women',
    '/women/jacket-women',
    '/women/shorttrouser-women',
    '/women/Jersey-women',
    '/women/tracksuits-women',
    '/women/dress-women',
    '/women/sweatshirt-women',
    '/women/skirt-women',
    '/women/sports-bra', // Thêm route mới
  ];
  const hideTabs = hideTabsRoutes.some(route => pathname.endsWith(route));
  return (
    <TeamLayout section="women" title="PICK YOUR TEAM" hideTabs={hideTabs}>
      {children}
    </TeamLayout>
  );
} 