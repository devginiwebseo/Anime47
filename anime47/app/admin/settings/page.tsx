import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/admin/settings/SettingsForm';

export const metadata = { title: 'Cài đặt Hệ Thống - Admin Panel' };

// No hardcoded defaults here, rely on DB or empty state

export default async function AdminSettingsPage() {
    // Lấy settings từ DB
    const [headerSetting, footerSetting, themeSetting] = await Promise.all([
        prisma.settings.findUnique({ where: { key: 'header' } }),
        prisma.settings.findUnique({ where: { key: 'footer' } }),
        prisma.settings.findUnique({ where: { key: 'theme' } }),
    ]);

    const headerSettings = (headerSetting?.value as any) || {
        siteName: '',
        logoUrl: '',
        showSearch: true,
        menuItems: [],
        announcement: '',
    };

    const footerSettings = (footerSetting?.value as any) || {
        copyrightText: '',
        description: '',
        socialLinks: [],
        footerLinks: [],
        showBackToTop: true,
    };

    const themeSettings = (themeSetting?.value as any) || {
        primaryColor: '#d32f2f',
        backgroundColor: '#111827',
        siteTitle: '',
        faviconUrl: '',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Cài Đặt Hệ Thống</h1>
                <p className="text-slate-500 text-sm mt-1">Quản lý cấu hình Header, Footer và Theme cho website.</p>
            </div>

            <SettingsForm
                initialHeaderSettings={headerSettings}
                initialFooterSettings={footerSettings}
                initialThemeSettings={themeSettings}
            />
        </div>
    );
}
