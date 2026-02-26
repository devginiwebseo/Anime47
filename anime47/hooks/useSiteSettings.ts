import { useState, useEffect } from 'react';

export interface MenuItem {
  label: string;
  href: string;
}

export interface SiteSettings {
  header: {
    siteName: string;
    logoUrl: string;
    showSearch: boolean;
    menuItems: MenuItem[];
    announcement: string;
  };
  footer: {
    copyrightText: string;
    description: string;
    socialLinks: { platform: string; url: string }[];
    footerLinks: MenuItem[];
    showBackToTop: boolean;
  };
  theme: {
    primaryColor: string;
    backgroundColor: string;
  };
}

const defaultSettings: SiteSettings = {
  header: {
    siteName: 'Anime47',
    logoUrl: '',
    showSearch: true,
    menuItems: [
        { label: 'Trang chủ', href: '/' },
        { label: 'Phim mới', href: '/new' },
        { label: 'Thể loại', href: '/genres' },
    ],
    announcement: '',
  },
  footer: {
    copyrightText: '© 2026 Anime47. All rights reserved.',
    description: 'Anime47 - Trang web xem anime chất lượng cao với phụ đề Việt.',
    socialLinks: [
        { platform: 'facebook', url: '' },
    ],
    footerLinks: [
        { label: 'Liên hệ', href: '/lien-he' },
        { label: 'Điều khoản', href: '/dieu-khoan' },
        { label: 'Riêng tư', href: '/chinh-sach-rieng-tu' },
    ],
    showBackToTop: true,
  },
  theme: {
    primaryColor: '#d32f2f', // Default red
    backgroundColor: '#111827', // Default gray-900
  }
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSettings({
            header: { ...defaultSettings.header, ...data.header },
            footer: { ...defaultSettings.footer, ...data.footer },
            theme: { ...defaultSettings.theme, ...data.theme }
          });
        }
      })
      .catch((err) => console.error("Failed to load settings", err))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
};
