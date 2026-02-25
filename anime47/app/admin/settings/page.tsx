import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/admin/settings/SettingsForm';

export const metadata = { title: 'Cài đặt Hệ Thống - Admin Panel' };

const defaultHeaderSettings = {
    siteName: 'Anime47',
    logoUrl: '',
    showSearch: true,
    menuItems: [
        { label: 'Trang chủ', href: '/' },
        { label: 'Phim mới', href: '/new' },
        { label: 'Thể loại', href: '/genres' },
    ],
    announcement: '',
};

const defaultFooterSettings = {
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
};

export default async function AdminSettingsPage() {
    // Lấy settings từ DB
    const [headerSetting, footerSetting] = await Promise.all([
        prisma.settings.findUnique({ where: { key: 'header' } }),
        prisma.settings.findUnique({ where: { key: 'footer' } }),
    ]);

    const headerSettings = headerSetting?.value
        ? { ...defaultHeaderSettings, ...(headerSetting.value as any) }
        : defaultHeaderSettings;

    const footerSettings = footerSetting?.value
        ? { ...defaultFooterSettings, ...(footerSetting.value as any) }
        : defaultFooterSettings;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Cài Đặt Hệ Thống</h1>
                <p className="text-slate-500 text-sm mt-1">Quản lý cấu hình Header và Footer cho website.</p>
            </div>

            <SettingsForm
                initialHeaderSettings={headerSettings}
                initialFooterSettings={footerSettings}
            />
        </div>
    );
}
