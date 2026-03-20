import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '강원 | Command Center',
  description: '강원푸드 통합 관리 플랫폼 — 전략, 운영, 재무, 고객 분석',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: 'var(--w-bg)', color: 'var(--w-text)' }}>
        {children}
      </body>
    </html>
  );
}
