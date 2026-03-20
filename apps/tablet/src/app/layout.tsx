import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '강원 | 테이블 주문',
  description: '강원 K-Food 테이블 태블릿 주문 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
        {children}
      </body>
    </html>
  );
}
