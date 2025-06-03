"use client";
import React from 'react';
import TeamLayout from '../../../components/layout/TeamLayout';

export default function MenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamLayout section="men" title="PICK YOUR TEAM">
      {children}
    </TeamLayout>
  );
} 