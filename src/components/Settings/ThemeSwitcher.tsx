import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setSetting } = useSettingsStore();

  const themes = [
    { id: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { id: 'light', label: 'Light', icon: <Sun size={16} /> },
    { id: 'system', label: 'System', icon: <Laptop size={16} /> },
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-textPrimary">App Interface Theme</label>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSetting('theme', t.id)}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-white/5 border-border text-textSecondary hover:bg-white/10 hover:text-textPrimary'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
