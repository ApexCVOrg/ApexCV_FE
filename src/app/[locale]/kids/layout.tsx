'use client';

import React from 'react';
import TeamLayout from '../../../components/layout/TeamLayout';

export default function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamLayout section="kids" title="PICK YOUR TEAM">
      {children}
    </TeamLayout>
  );
} 