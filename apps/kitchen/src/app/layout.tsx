import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '강원 | 주방 디스플레이 (KDS)',
  description: '강원 K-Food 주방 주문 관리 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-900 min-h-screen text-white">
        {children}
      </body>
    </html>
  );
}
