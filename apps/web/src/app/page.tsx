'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, UtensilsCrossed, Users, Target, PieChart,
  Settings, ChefHat, Bell, TrendingUp, Building2, UserCheck
} from 'lucide-react';
import { CommandCenter } from '../components/CommandCenter';
import { MenuLab } from '../components/MenuLab';
import { CustomerPulse } from '../components/CustomerPulse';
import { StrategyBoard } from '../components/StrategyBoard';
import { ReportsView } from '../components/ReportsView';
import { StaffManagement } from '../components/StaffManagement';
import { OrderManagement } from '../components/OrderManagement';
import { BackOffice } from '../components/BackOffice';
import { SettingsView } from '../components/SettingsView';

type View = 'dashboard' | 'orders' | 'menu_lab' | 'customers' | 'strategy' | 'reports' | 'kitchen_monitor' | 'staff' | 'settings' | 'back_office';

const NAV_ITEMS: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { key: 'orders', label: '주문 관리', icon: Bell },
  { key: 'menu_lab', label: 'Menu Lab', icon: UtensilsCrossed },
  { key: 'customers', label: 'Customer Pulse', icon: Users },
  { key: 'strategy', label: 'Strategy Board', icon: Target },
  { key: 'reports', label: '리포트', icon: PieChart },
  { key: 'kitchen_monitor', label: '주방 모니터', icon: ChefHat },
  { key: 'staff', label: '직원 관리', icon: UserCheck },
  { key: 'back_office', label: '백오피스 (재무)', icon: Building2 },
  { key: 'settings', label: '설정', icon: Settings },
];

export default function ManagerDashboard() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold">강원</h1>
          <p className="text-xs text-slate-400 mt-1">KANGWON · 강원푸드 iCAN Platform</p>
          <p className="text-xs text-slate-500 mt-0.5">{time}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeView === item.key
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
              김
            </div>
            <div>
              <p className="text-sm font-medium">김철수</p>
              <p className="text-xs text-slate-500">점장 (Manager)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {activeView === 'dashboard' && <CommandCenter />}
        {activeView === 'orders' && <OrderManagement />}
        {activeView === 'menu_lab' && <MenuLab />}
        {activeView === 'customers' && <CustomerPulse />}
        {activeView === 'strategy' && <StrategyBoard />}
        {activeView === 'reports' && <ReportsView />}
        {activeView === 'kitchen_monitor' && <KitchenMonitor />}
        {activeView === 'staff' && <StaffManagement />}
        {activeView === 'back_office' && <BackOffice />}
        {activeView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

// --- 주방 모니터 (KDS 원격) ---
function KitchenMonitor() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800">주방 모니터</h2>
      <p className="text-slate-500 mt-1 mb-6">KDS 원격 모니터링</p>
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700" style={{ height: '70vh' }}>
        <iframe
          src="http://localhost:3002"
          className="w-full h-full border-0"
          title="Kitchen Display"
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">주방 디스플레이 (http://localhost:3002) 실시간 임베드</p>
    </div>
  );
}

function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
      <p className="text-slate-500 mt-1 mb-8">{description}</p>
      <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
        <p className="text-slate-400 text-lg">Phase 3에서 구현 예정</p>
        <p className="text-slate-300 text-sm mt-2">기존 kangwon-food-manager의 재무 기능이 마이그레이션됩니다</p>
      </div>
    </div>
  );
}
