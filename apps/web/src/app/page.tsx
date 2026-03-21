'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { CommandCenter } from '../components/CommandCenter';
import { MenuLab } from '../components/MenuLab';
import { CustomerPulse } from '../components/CustomerPulse';
import { StrategyBoard } from '../components/StrategyBoard';
import { ReportsView } from '../components/ReportsView';
import { StaffManagement } from '../components/StaffManagement';
import { OrderManagement } from '../components/OrderManagement';
import { BackOffice } from '../components/BackOffice';
import { SettingsView } from '../components/SettingsView';
import { StaffTraining } from '../components/StaffTraining';

type View = 'dashboard' | 'orders' | 'menu_lab' | 'customers' | 'strategy' | 'reports' | 'kitchen_monitor' | 'staff' | 'staff_training' | 'settings' | 'back_office';

const NAV_ITEMS: { key: View; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Command Center', icon: 'solar:widget-5-bold-duotone' },
  { key: 'orders', label: '주문 관리', icon: 'solar:bell-bold-duotone' },
  { key: 'menu_lab', label: 'Menu Lab', icon: 'solar:chef-hat-bold-duotone' },
  { key: 'customers', label: 'Customer Pulse', icon: 'solar:users-group-rounded-bold-duotone' },
  { key: 'strategy', label: 'Strategy Board', icon: 'solar:target-bold-duotone' },
  { key: 'reports', label: '리포트', icon: 'solar:chart-2-bold-duotone' },
  { key: 'kitchen_monitor', label: '주방 모니터', icon: 'solar:monitor-bold-duotone' },
  { key: 'staff', label: '직원 관리', icon: 'solar:user-check-bold-duotone' },
  { key: 'staff_training', label: '직원 교육', icon: 'solar:book-2-bold-duotone' },
  { key: 'back_office', label: '백오피스', icon: 'solar:buildings-2-bold-duotone' },
  { key: 'settings', label: '설정', icon: 'solar:settings-bold-duotone' },
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
      {/* Sidebar */}
      <aside className="w-60 flex flex-col fixed h-full"
             style={{ backgroundColor: 'var(--w-surface)', borderRight: '1px solid var(--w-border)' }}>
        <div className="p-5 pb-4" style={{ borderBottom: '1px solid var(--w-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: 'var(--w-accent-dim)' }}>
                <Icon icon="solar:chef-hat-heart-bold-duotone" width={18} style={{ color: 'var(--w-accent)' }} />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--w-text)' }}>강원</h1>
                <p className="text-[10px]" style={{ color: 'var(--w-text-muted)' }}>{time}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <a href="https://kangwon-tablet.vercel.app" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-premium hover:scale-110"
                style={{ backgroundColor: 'var(--w-elevated)' }}
                title="태블릿 주문">
                <Icon icon="solar:tablet-bold-duotone" width={16} style={{ color: 'var(--w-text-muted)' }} />
              </a>
              <a href="https://kangwon-kitchen.vercel.app" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-premium hover:scale-110"
                style={{ backgroundColor: 'var(--w-elevated)' }}
                title="주방 KDS">
                <Icon icon="solar:chef-hat-bold-duotone" width={16} style={{ color: 'var(--w-text-muted)' }} />
              </a>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ease-premium"
              style={activeView === item.key ? {
                backgroundColor: 'var(--w-accent-dim)',
                color: 'var(--w-accent)',
              } : {
                color: 'var(--w-text-muted)',
              }}
            >
              <Icon icon={item.icon} width={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--w-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                 style={{ backgroundColor: 'var(--w-accent-dim)', color: 'var(--w-accent)' }}>
              김
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--w-text)' }}>김철수</p>
              <p className="text-[10px]" style={{ color: 'var(--w-text-muted)' }}>점장</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 p-7 min-h-screen">
        {activeView === 'dashboard' && <CommandCenter />}
        {activeView === 'orders' && <OrderManagement />}
        {activeView === 'menu_lab' && <MenuLab />}
        {activeView === 'customers' && <CustomerPulse />}
        {activeView === 'strategy' && <StrategyBoard />}
        {activeView === 'reports' && <ReportsView />}
        {activeView === 'kitchen_monitor' && <KitchenMonitor />}
        {activeView === 'staff' && <StaffManagement />}
        {activeView === 'staff_training' && <StaffTraining />}
        {activeView === 'back_office' && <BackOffice />}
        {activeView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

function KitchenMonitor() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--w-text)' }}>주방 모니터</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--w-text-muted)' }}>KDS 원격 모니터링</p>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--w-border)', height: '70vh' }}>
        <iframe src="http://localhost:3002" className="w-full h-full border-0" title="Kitchen Display" />
      </div>
      <p className="text-[11px] mt-2" style={{ color: 'var(--w-text-muted)' }}>
        주방 디스플레이 (localhost:3002) 실시간 임베드
      </p>
    </div>
  );
}
