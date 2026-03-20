import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '강원 | Command Center',
  description: '강원푸드 통합 관리 플랫폼 — 전략, 운영, 재무, 고객 분석',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
