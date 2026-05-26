import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  uploadModalOpen: boolean;
  settingsModalOpen: boolean;
  searchDrawerOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openUpload: (open: boolean) => void;
  openSettings: (open: boolean) => void;
  openSearch: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  uploadModalOpen: false,
  settingsModalOpen: false,
  searchDrawerOpen: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openUpload: (open) => set({ uploadModalOpen: open }),
  openSettings: (open) => set({ settingsModalOpen: open }),
  openSearch: (open) => set({ searchDrawerOpen: open }),
}));
