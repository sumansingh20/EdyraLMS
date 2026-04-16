'use client';

import PublicMoodleShell from './PublicMoodleShell';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <PublicMoodleShell heading="Portal Information">{children}</PublicMoodleShell>;
}
