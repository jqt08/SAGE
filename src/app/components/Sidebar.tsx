import { LayoutDashboard, TrendingUp, Database, Settings, BarChart3 } from 'lucide-react';
import { renderActiveTab } from './DashboardPage';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Predict Game Success', icon: TrendingUp },
    { id: 'datasets', label: 'Dataset Explorer', icon: Database },
    { id: 'model-insights', label: 'Model Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-white border-r border-gray-300">
      <nav className="p-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors ${
                activeTab === item.id ? 'bg-gray-50' : ''
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {renderActiveTab(activeTab)}
    </aside>
  );
}