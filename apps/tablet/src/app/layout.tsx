import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '강원 | 테이블 주문',
  description: '강원 K-Food 테이블 태블릿 주문 시스템',
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
