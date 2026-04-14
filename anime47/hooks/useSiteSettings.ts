'use client';

import { useSettings } from '@/components/providers/SettingsProvider';
export type { SiteSettings, MenuItem } from '@/components/providers/SettingsProvider';

/**
 * Hook to access site settings. 
 * Now integrated with SettingsProvider to avoid redundant fetches and ensure immediate availability.
 */
export const useSiteSettings = () => {
  const { settings, loading } = useSettings();
  return { settings, loading };
};
