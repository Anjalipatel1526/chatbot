import React from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import UploadModal from '@/components/Upload/UploadModal';
import SettingsModal from '@/components/Settings/SettingsModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans select-none">
      {/* Sidebar (left) */}
      <Sidebar />

      {/* Main Content Viewport (right) */}
      <main className="flex-1 h-full min-w-0 overflow-hidden relative bg-background">
        {children}
      </main>

      {/* Global Overlays & Portals */}
      <UploadModal />
      <SettingsModal />
    </div>
  );
};

export default AppLayout;
