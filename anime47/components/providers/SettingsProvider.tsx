'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MenuItem {
  label: string;
  href: string;
}

export interface SiteSettings {
  header: {
    siteName: string;
    logoUrl: string;
    showSearch: boolean;
    menuItems: any[];
    announcement: string;
  };
  footer: {
    copyrightText: string;
    description: string;
    socialLinks: { platform: string; url: string }[];
    footerLinks: any[];
    showBackToTop: boolean;
  };
  theme: {
    primaryColor: string;
    backgroundColor: string;
    isIndexed: boolean;
    siteTitle?: string;
  };
}

const defaultSettings: SiteSettings = {
  header: {
    siteName: 'Anime47',
    logoUrl: '',
    showSearch: true,
    menuItems: [],
    announcement: '',
  },
  footer: {
    copyrightText: '',
    description: '',
    socialLinks: [],
    footerLinks: [],
    showBackToTop: true,
  },
  theme: {
    primaryColor: '#d32f2f',
    backgroundColor: '#111827',
    isIndexed: false,
    siteTitle: '',
  }
};

const SettingsContext = createContext<{
  settings: SiteSettings;
  loading: boolean;
}>({
  settings: defaultSettings,
  loading: true,
});

export function SettingsProvider({ 
  children, 
  initialSettings 
}: { 
  children: React.ReactNode; 
  initialSettings?: SiteSettings;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || defaultSettings);
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    // Only fetch if initial settings weren't provided or we want to ensure fresh data
    // Usually on first mount we want to sync with server
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/public');
        const data = await res.json();
        if (data) {
          setSettings({
            header: { ...defaultSettings.header, ...data.header },
            footer: { ...defaultSettings.footer, ...data.footer },
            theme: { ...defaultSettings.theme, ...data.theme }
          });
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
