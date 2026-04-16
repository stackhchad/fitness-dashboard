'use client';

import { useUIStore } from '@/store/useUIStore';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore(s => s.sidebarOpen);
  const activeToast = useUIStore(s => s.activeToast);
  const clearToast = useUIStore(s => s.clearToast);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`transition-all duration-200 ${sidebarOpen ? 'ml-60' : 'ml-16'} min-h-screen`}>
        {children}
      </main>

      {/* Toast */}
      {activeToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg cursor-pointer transition-all ${
            activeToast.type === 'error' ? 'bg-red-600' :
            activeToast.type === 'success' ? 'bg-green-600' : 'bg-indigo-600'
          }`}
          onClick={clearToast}
        >
          {activeToast.message}
        </div>
      )}
    </div>
  );
}
