'use client';

import React from 'react';
import TeamLayout from '../../../components/layout/TeamLayout';

export default function WomenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamLayout section="women" title="PICK YOUR TEAM">
      {children}
    </TeamLayout>
  );
} 