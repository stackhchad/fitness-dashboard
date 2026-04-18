'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useUIStore } from '@/store/useUIStore';

const NAV = [
  { href: '/',             label: 'Dashboard',    icon: '▦' },
  { href: '/workouts',     label: 'Workouts',     icon: '🏋' },
  { href: '/progress',     label: 'Progress',     icon: '📈' },
  { href: '/measurements', label: 'Measurements', icon: '⚖' },
  { href: '/goals',        label: 'Goals',        icon: '🎯' },
  { href: '/performance',  label: 'Performance',  icon: '⭐' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white flex flex-col transition-all duration-200 z-40 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-gray-700">
        <span className="text-xl font-bold text-indigo-400 mr-2">F</span>
        {sidebarOpen && <span className="text-sm font-semibold truncate">Fitness Dashboard</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
              {sidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className={`px-3 py-2 border-t border-gray-700 ${sidebarOpen ? '' : 'flex justify-center'}`}>
        <button
          onClick={() => authClient.signOut()}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? 'Sign out' : '↪'}
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 border-t border-gray-700 text-gray-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? '←' : '→'}
      </button>
    </aside>
  );
}
