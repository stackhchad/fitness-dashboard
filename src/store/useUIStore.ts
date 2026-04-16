import { create } from 'zustand';

interface Toast { message: string; type: 'success' | 'error' | 'info' }

interface UIStore {
  sidebarOpen: boolean;
  activeToast: Toast | null;
  toggleSidebar: () => void;
  showToast: (toast: Toast) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeToast: null,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  showToast: (toast) => {
    set({ activeToast: toast });
    setTimeout(() => set({ activeToast: null }), 3500);
  },
  clearToast: () => set({ activeToast: null }),
}));
