import { useState, useEffect } from 'react';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  header: {
    backgroundColor: string;
    textColor: string;
    showSearch: boolean;
  };
  footer: {
    content: string;
    copyright: string;
    backgroundColor: string;
    textColor: string;
  };
  seo: {
    noIndex: boolean;
    headTags: string;
  };
  schema: {
    homepageSchema: string;
    customScripts: string;
  };
  customJs: string;
  socials: {
    facebook: string;
    twitter: string;
    discord: string;
  };
}

const defaultSettings: SiteSettings = {
  siteName: "Anime47",
  siteDescription: "Website đọc truyện tranh online lớn nhất",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  header: {
    backgroundColor: "#1890ff",
    textColor: "#ffffff",
    showSearch: true,
  },
  footer: {
    content: "Anime47 - Đọc truyện tranh online",
    copyright: "© 2024 Anime47. All rights reserved.",
    backgroundColor: "#001529",
    textColor: "#ffffff",
  },
  seo: {
    noIndex: false,
    headTags: "",
  },
  schema: {
    homepageSchema: "",
    customScripts: "",
  },
  customJs: "",
  socials: {
    facebook: "",
    twitter: "",
    discord: "",
  },
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("Failed to load settings", err))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
};
