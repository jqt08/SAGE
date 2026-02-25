import { useState } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { DashboardPage } from '@/app/components/DashboardPage';
import { PredictPage } from '@/app/components/PredictPage';
import { DatasetsPage } from '@/app/components/DatasetsPage';
import { ModelInsightsPage } from '@/app/components/ModelInsightsPage';
import { SettingsPage } from '@/app/components/SettingsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('App rendering with activeTab:', activeTab);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'predict':
        return <PredictPage />;
      case 'datasets':
        return <DatasetsPage />;
      case 'model-insights':
        return <ModelInsightsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>
      
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Menu</span>
          </button>
        </div>

        {renderPage()}
      </main>
    </div>
  );
}