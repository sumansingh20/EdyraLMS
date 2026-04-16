'use client';

import React from 'react';

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef3f8 100%)',
      }}
    >
      {children}
    </div>
  );
}
