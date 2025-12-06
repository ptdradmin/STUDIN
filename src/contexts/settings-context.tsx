
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of your settings
interface AppSettings {
  isPrivateProfile: boolean;
  pauseAllNotifications: boolean;
  autoPlayReels: boolean;
  defaultReelSound: 'muted' | 'unmuted';
}

// Define the context type
interface SettingsContextType {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

// Default settings
const defaultSettings: AppSettings = {
  isPrivateProfile: false,
  pauseAllNotifications: false,
  autoPlayReels: true,
  defaultReelSound: 'muted',
};

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create the provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Lazy initialization from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = window.localStorage.getItem('studin-app-settings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
      } catch (error) {
        console.error('Failed to parse settings from localStorage', error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem('studin-app-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, [settings]);

  // Function to update a single setting
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };


  return (
    <SettingsContext.Provider value={{ settings, setSettings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Create a custom hook to use the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
